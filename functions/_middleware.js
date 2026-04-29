export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (
    url.hostname === 'emd-pflanzliche-beruhigungsmittel-testsieger.pages.dev' ||
    url.hostname === 'www.pflanzliche-beruhigungsmittel-testsieger.de'
  ) {
    url.hostname = 'pflanzliche-beruhigungsmittel-testsieger.de';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
