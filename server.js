const app = require("./src/app");
const PORT = process.env.PORT || 3056;

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
