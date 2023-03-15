const app = require("./src/app");
const PORT = 3055;

const server = app.listen(PORT, () => {
  console.log(`WSV ecommerce start with ${PORT}`);
});

process.on("SIGINT", () => {
  // phương thức sigint là lúc ta nhấn ctrl c trên terminal để ngắt server
  server.close(() => {
    console.log(`exit server express`);
  });
});
//file server chỉ để kết nối network ko nên đụng sửa
