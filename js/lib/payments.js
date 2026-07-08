/** Stripe checkout for premium courses */
window.BSPayments = {
  _purchased: [],

  clear() {
    this._purchased = [];
  },

  setPurchased(ids) {
    this._purchased = Array.isArray(ids) ? [...ids] : [];
  },

  getPurchased() {
    return [...this._purchased];
  },

  ownsCourse(courseId) {
    const course = window.getCourseById?.(courseId);
    if (course?.free) return true;
    return this._purchased.includes(courseId);
  },

  async syncFromState(state) {
    if (state?.purchased) {
      this.setPurchased(state.purchased);
    }
  },

  async syncPurchases() {
    if (!window.BSAuth?.isLoggedIn?.() || !window.BSAuth?.apiEnabled) return;
    try {
      const res = await window.BSAPI.get("/payments/purchases/");
      this.setPurchased(res.purchased || []);
    } catch (e) {
      console.warn("Purchase sync failed", e);
    }
  },

  async startCheckout(courseId) {
    if (!window.BSAuth?.isLoggedIn?.()) {
      return { ok: false, error: "auth", message: "Sign in to purchase this course." };
    }
    if (!window.BSAuth?.isVerified?.()) {
      return { ok: false, error: "verify", message: "Verify your email before purchasing." };
    }

    try {
      const res = await window.BSAPI.post("/payments/checkout/", { course_id: courseId });
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
        return { ok: true, redirecting: true };
      }
      return { ok: false, message: "Checkout could not be started." };
    } catch (e) {
      return {
        ok: false,
        error: e.data?.error || "checkout",
        message: e.data?.message || e.message || "Payment unavailable.",
      };
    }
  },

  async confirmCheckout(sessionId) {
    return window.BSAPI.post("/payments/confirm/", { session_id: sessionId });
  },

  formatPrice(course) {
    if (course?.free) return "Free";
    const cents = course?.priceCents || 4900;
    return `$${(cents / 100).toFixed(0)}`;
  },
};
