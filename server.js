const port = Deno.env.get("PORT");

let subs = new Map();

Deno.serve({ port }, async (request) => {
  const { method } = request;
  const url = new URL(request.url);

  const time = new Date().toLocaleTimeString("en-GB");
  console.log(`${time} ${method} ${url.pathname}`);

  switch (`${method} ${url.pathname}`) {
    case "GET /": {
      for (let sub of subs) {
        console.log(sub);
      }
      return file("index.html", {
        headers: {
          "content-type": "text/html; charset=UTF-8",
          "Service-Worker-Allowed": "/",
        },
      });
    }
    case "GET /service-worker.js":
      return file("service-worker.js", {
        headers: {
          "content-type": "application/javascript; charset=UTF-8",
          "Service-Worker-Allowed": "/",
        },
      });
    case "GET /vapid":
      return file("vapid", {
        headers: { "content-type": "text/plain; charset=UTF-8" },
      });
    case "POST /register": {
      let subscription = await request.json();
      console.log(subscription);
      subs.set(subscription.endpoint, subscription);
      return new Response("", { status: 201 });
    }
    case "POST /unregister": {
      let subscription = await request.json();
      subs.delete(subscription.endpoint);
      return new Response("", { status: 201 });
    }
    case "POST /notify": {
      for (let sub of subs.values()) {
        fetch(sub.endpoint, {
          method: "POST",
          headers: { ttl: 60 },
        }).then(console.log);
      }
      return new Response("", { status: 201 });
    }
    default:
      return new Response("not found", { status: 404 });
  }
});

async function file(name, init) {
  let file = await Deno.open("./public/" + name);
  return new Response(file.readable, init);
}
