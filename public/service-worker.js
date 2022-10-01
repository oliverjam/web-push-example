self.addEventListener("push", (event) => {
  event.waitUntil(notify());
});

function notify() {
  return self.registration.showNotification("Test notification", {
    body: "Push Notification Subscription Management",
  });
}
