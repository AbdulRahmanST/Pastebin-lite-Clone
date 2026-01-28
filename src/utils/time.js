export function now(req){
  if(process.env.TEST_MODE === "1" && req.header("x-test-now-ms")){
    return Number(req.header("x-test-now-ms"));
  }
  return Date.now();
}
