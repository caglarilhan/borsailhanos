export async function GET() {
  const payload = {
    ok: true,
    service: "feevigil-web",
    ts: new Date().toISOString(),
  };
  return Response.json(payload, { status: 200 });
}


