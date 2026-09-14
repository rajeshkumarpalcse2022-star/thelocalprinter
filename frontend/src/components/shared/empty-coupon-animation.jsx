"use client";

export function EmptyCouponAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <img
        src="/nothing.gif"
        alt="No coupons"
        className="mb-4 h-48 w-48 object-contain"
      />
      <p className="text-base font-bold text-foreground mb-1">No Coupon Available</p>
      <p className="max-w-[260px] text-sm text-muted-foreground leading-relaxed">
        You don&apos;t have any coupons assigned yet. Check back later!
      </p>
    </div>
  );
}
