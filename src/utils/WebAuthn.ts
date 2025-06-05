// WebAuthn utility functions for registration and authentication

export async function registerWebAuthnCredential(username: string): Promise<Credential | null> {
  if (!window.PublicKeyCredential) {
    alert('WebAuthn not supported in this browser.');
    return null;
  }

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
    rp: { name: "OSFM Credentials Manager" },
    user: {
      id: Uint8Array.from(username, c => c.charCodeAt(0)),
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Prefer device biometrics
      userVerification: "required",
    },
    timeout: 60000,
    attestation: "none",
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    return credential;
  } catch (e) {
    console.error("WebAuthn registration failed:", e);
    return null;
  }
}

export async function authenticateWebAuthnCredential(credentialId: ArrayBuffer): Promise<Credential | null> {
  if (!window.PublicKeyCredential) {
    alert('WebAuthn not supported in this browser.');
    return null;
  }

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
    allowCredentials: [
      {
        id: credentialId,
        type: "public-key",
        transports: ["internal"],
      },
    ],
    userVerification: "required",
    timeout: 60000,
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    return assertion;
  } catch (e) {
    console.error("WebAuthn authentication failed:", e);
    return null;
  }
}