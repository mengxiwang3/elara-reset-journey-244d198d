import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Dialog } from "@/components";
import { useT } from "@/i18n";
import { signOut } from "@/lib/authClient";
import { clearAudioCaches } from "@/lib/deviceData";
import { cancelDailyReminder, unregisterFromPush } from "@/lib/notifications";
import { cancelWorkshopReminders } from "@/lib/workshopReminders";
import { logoutPurchases } from "@/lib/purchases";
import { queryClient } from "@/lib/query";
import { beginDeliberateEnd } from "@/lib/sessionEnd";
import { setSigningOut } from "@/lib/signingOut";
import { unsentCount } from "@/store/accountState";
import { useAppStore } from "@/store/useAppStore";

/** The longest the push-token removal may hold up the sign-out itself. */
const UNREGISTER_MAX_MS = 4000;
/** The longest the rest may take before the phone signs her out locally anyway. */
const TEARDOWN_MAX_MS = 6000;
/** The longest a last try at sending her unsent answers may hold up the sign-out. */
const FLUSH_MAX_MS = 4000;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Send what she has not sent yet, while there is still a session to send it
 * under. Log out clears the queues (`endSession("signedOut")`): whatever is
 * still in them after this is gone, which is why the dialog asks first.
 */
function flushUnsent(): Promise<unknown> {
  const s = useAppStore.getState();
  return Promise.all([s.flushSteps(), s.flushCheckIns(), s.flushFeedback()]).catch(() => {});
}

/**
 * Only the push-token removal is capped *before* the sign-out. It used to be
 * awaited whole (its own timeout is 15 s), the overall cap then fired first,
 * and the welcome screen appeared while `signOut()` had never been called:
 * the stored session cookie (cleared by its request hook, before any network)
 * and the server session both survived a closed app.
 */
async function teardown() {
  // Her answers first, while the session that owns them is still here.
  await Promise.race([flushUnsent(), wait(FLUSH_MAX_MS)]);
  // Drop this device's push token first: it still needs the session.
  await Promise.race([unregisterFromPush().catch(() => {}), wait(UNREGISTER_MAX_MS)]);
  // Started now and never skipped. Its request hook clears the stored cookie
  // straight away; the network half is capped below like everything else.
  const out = signOut().catch(() => {});
  // Her reminders are hers: the next person on this phone gets none of them.
  await Promise.all([cancelDailyReminder().catch(() => {}), cancelWorkshopReminders().catch(() => {})]);
  await Promise.race([
    Promise.all([
      out,
      logoutPurchases().catch(() => {}),
      // Her conversation read aloud stays with her, not with the phone.
      clearAudioCaches().catch(() => {}),
    ]),
    wait(TEARDOWN_MAX_MS),
  ]);
}

export default function LogoutModal() {
  const t = useT();
  const router = useRouter();
  const localSignOut = useAppStore((s) => s.signOut);
  // A guest's progress lives on an account she can't sign back in to. The
  // usual "it'll be here when you return" would be untrue, so she is told
  // plainly and offered the way to keep it instead.
  const guest = useAppStore((s) => !!s.user?.isAnonymous);
  // Answers given on this phone that have not reached her account. Logging
  // out deletes them, so «se quedan aquí, guardados» would be untrue: she is
  // asked instead, and the queue is tried once more while she reads.
  const unsent = useAppStore((s) => unsentCount(s, s.user?.id));
  useEffect(() => {
    if (unsent > 0) void flushUnsent();
    // On arrival only; the count above follows the queue as it drains.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const copy = guest
    ? {
        title: t.account.guest.logoutTitle,
        body: t.account.guest.logoutBody,
        confirm: t.account.guest.logoutConfirm,
        cancel: t.account.guest.logoutSave,
      }
    : unsent > 0
      ? {
          title: t.account.logout.unsentTitle,
          body: t.account.logout.unsentBody,
          confirm: t.account.logout.unsentConfirm,
          cancel: t.account.logout.cancel,
        }
      : t.account.logout;
  return (
    <Dialog
      icon="solar:logout-bold"
      title={copy.title}
      body={copy.body}
      confirmLabel={copy.confirm}
      onConfirm={async () => {
        // Hand the screen to the entry gate *before* anything is torn down.
        // Signing out flips the route guards and removes Settings and the tabs,
        // which would leave this transparent dialog as the only route, with
        // nothing opaque under it. The gate holds a plain canvas while this
        // flag is set and picks the screen once the session is gone.
        setSigningOut(true);
        // A deliberate end: what she has not sent is cleared with the rest,
        // not held as it would be for an expired session (`classifySessionEnd`).
        beginDeliberateEnd("signedOut");
        router.replace("/");
        try {
          // Each step is best-effort and a slow one (a weak connection, the
          // store) must not hold her on the canvas: past the cap the local
          // sign-out below still ends the session on this phone.
          await teardown();
        } finally {
          localSignOut();
          queryClient.clear();
          // The gate now sees no session and routes to the welcome screen.
          setSigningOut(false);
        }
      }}
      cancelLabel={copy.cancel}
      onCancel={() => (guest ? router.replace("/(auth)/create-account") : router.back())}
    />
  );
}
