(function () {
  const params = new URLSearchParams(location.search);
  const certId = params.get("id");
  const loading = document.getElementById("certLoading");
  const invalid = document.getElementById("certInvalid");
  const valid = document.getElementById("certValid");

  async function boot() {
    if (!certId) {
      loading?.classList.add("hidden");
      invalid?.classList.remove("hidden");
      return;
    }

    if (window.BSAuth?.isLoggedIn?.()) {
      document.getElementById("certDashLink").style.display = "";
      document.getElementById("certProfileLink").style.display = "";
    }

    try {
      const data = await window.BSAPI.get(`/learning/certificates/verify/${certId}/`);
      if (!data.valid) throw new Error("Invalid");

      loading?.classList.add("hidden");
      valid?.classList.remove("hidden");

      document.getElementById("certCourseTitle").textContent = data.courseTitle;
      document.getElementById("certStudentName").textContent = data.studentName;
      document.getElementById("certIssuedAt").textContent = new Date(data.issuedAt).toLocaleDateString(
        undefined,
        { year: "numeric", month: "long", day: "numeric" }
      );
      document.getElementById("certId").textContent = data.certificateId;
    } catch {
      loading?.classList.add("hidden");
      invalid?.classList.remove("hidden");
    }

    document.getElementById("certPrintBtn")?.addEventListener("click", () => window.print());
  }

  window.BSAuth?.onReady(boot);
  if (window.BSAuth?.ready) boot();
})();
