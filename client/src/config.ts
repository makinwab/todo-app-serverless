// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'fc7ijj7pij'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-jn1ijedp.eu.auth0.com',            // Auth0 domain
  clientId: '9WgLWhUsntFM5hqyGlH0qRtS3ltnB1C4',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
