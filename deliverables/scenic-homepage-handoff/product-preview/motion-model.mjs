export const LENGTH=11,COUNT=5;
export function timeline(seconds){const t=Math.max(0,Math.min(COUNT*LENGTH,Number.isFinite(seconds)?seconds:0));const index=Math.min(COUNT-1,Math.floor(t/LENGTH));return {index,progress:Math.min(1,(t-index*LENGTH)/LENGTH),ended:t===COUNT*LENGTH};}
export function jump(index){return Math.max(0,Math.min(COUNT-1,Math.trunc(index)))*LENGTH;}
