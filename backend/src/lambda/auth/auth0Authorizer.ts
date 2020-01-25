import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'
const authCert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJa3nMSZ2qqDxVMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1qbjFpamVkcC5ldS5hdXRoMC5jb20wHhcNMjAwMTE5MTAyNzEyWhcN
MzMwOTI3MTAyNzEyWjAkMSIwIAYDVQQDExlkZXYtam4xaWplZHAuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArCVbzYPVSlRqECXa
45stKFj4z8Hs6DMtCFzqCOOyYpqf+N/+OeMoS5r/Z2wJuKRKerf44SsurLY8W5WI
oFWrtOskinhrCF+6LXDGOsMnYRlQByV+e/HoBcMqaNsylifotAemgJa1VO5OX2Yv
sThF9iiQ+UIwbq0dvc0v53teGGadH61uTi5tRf7vZnl5P0TN46N1Cwv/ZUNO8q9Z
s+AWKNkQtSXcmuIygyBaa5DQkNN2M7CQdKpsXj3ApF+tT8U7FjaKcQFJTaU+Q/Hn
nKtBOSGTOleW838aiArAeBu97jLclpJEiabsOaQhKVNkHRGSYuVjNsV+nggI7aW+
hytW0wIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRu0MeAqZI/
QVKtRBohrpXF9tmO7zAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACu9kcf2wByY3KbZgoZKKQHPGrQyPuOBpUEAaT/CDRgOtuLheqlBBwQ+6mNUrNQD
TIP/QrupYoQPkjH0hn3aQwLUvxMtx7LNANCoNNMhXP84KpWFR7I3CxZDj4SMsI9g
q/SAYNKPzO4NcFOEKZ3LA1r5a7SZOqX8GGfJdzu7ZrN3CdXlqfnk/9N+oT2nH55k
Wlrg7/d/OS+lulx1tnzZ9gvJ/DvypcwFN8PlacsGKMuDGmXIxFUxp19I+Kft9QLs
1O5lm0bP7wcU4cVEVvy0bg30Ys4Bh/j0gT6ekbvS92AVMnHkH04Pnlm7TCymRULW
b6DGb4jShq/edVxWCDnoCUY=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, authCert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
