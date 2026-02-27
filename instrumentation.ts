export async function register() {
  const { addErrorObserver } = await import("@/lib/api");

  addErrorObserver((error) => {
    if (error.status >= 500 || error.status === 0) {
      console.error("[API Error]", {
        status: error.status,
        message: error.message,
      });
    }
  });
}
