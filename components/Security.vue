<!--
###############################################################################
#
# thesplit - A client application for the secure sharing of secrets.
# Copyright (c) 2016  Glenn Rempe
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
###############################################################################
-->

<template>
  <div id="security">

    <h4>Security</h4>
    
    <div class="row">
      <div class="col-md-12">
      <p class="lead">This security design of this application is guided by a single overarching
        principle; that the security and privacy of our users, and the confidentiality
        and integrity of the information they choose to share, is paramount. All other
        considerations are secondary. Period. Full-stop.</p>
      </div>
    </div>

    <div class="row">
        <div class="col-md-6">
          <h4>End-To-End Encrypted</h4>
          <p>All user content is encrypted locally in the browser before being
              transmitted to the server for sharing. All data is encrypted with
              <a href="http://tweetnacl.cr.yp.to/index.html" target="_blank">TweetNaCl</a>/
              <a href="http://nacl.cr.yp.to" target="_blank">NaCl</a> compatible
              Secret Key Authenticated Encryption (XSalsa20-Poly1305). Only the person who
              creates a secret, and their chosen recipient, ever has possession of the
              secret key material needed to decrypt or authenticate a secret.</p>

          <p>A secure Random Number Generator (CSPRNG) generates a 16 byte (128 bit)
              one-time use random key. This key material is stretched to 64 bytes,
              using the <a href="https://en.wikipedia.org/wiki/Scrypt" target="_blank">Scrypt Key Derivation Function (KDF)</a>.
              The first 32 bytes of this stretched key material is used as the symmetric key
              for an NaCl 'Secret Box', while the second 32 bytes are used as a BLAKE2s HMAC key to
              authenticate the entire server payload. The following security libraries are used
              in the client. No crypto libraries are required on the server.
          </p>
          <p>
            <ul>
              <li><a href="https://tweetnacl.js.org/#/" target="_blank">TweetNaCl.js</a></li>
              <li><a href="https://github.com/dchest/blake2s-js" target="_blank">BLAKE2s</a></li>
              <li><a href="https://github.com/cryptocoinjs/scryptsy" target="_blank">scryptsy</a></li>
            </ul>
          </p>
        </div>

        <div class="col-md-6">
          <h4>Zero-Knowledge Server</h4>
          <p>The most important security principle for the server is that it cannot reveal secrets it
              never had. Even if the server were to be fully compromised and publicly exposed, it can
              only reveal fully encrypted material, secured with a 32 byte (256 bit) key, which
              will be of little use to an attacker who might only be able to learn the length of
              the encrypted material.</p>

              <p>Other secret sharing applications submit the plaintext secret data to the server
              and depend on the server to perform all encryption operations, and only then return the
              key materials and URL's needed for sharing. Even if the server claims it does not
              retain any of this highly sensitive information during normal operation, or even if it
              takes extraordinary measures to erase it from memory, disk, and swap space,
              the fact of the matter is that it cannot un-see what it has seen. This security model
              requires the person sharing sensitive information to trust that the server has not been
              compromised by criminals, governments carrying out surveillance, or a malicious server
              administrator. In these situations neither the sender nor the recipient can ever know
              if their data has been compromised or not.</p>

           <p>We address this concern by assuming the server is always compromised and can never
               be trusted with secret keys or plaintext secrets. Only fully encrypted data, and the
               nonces and salts that can safely be stored, will ever be shared with the server
               by the client. The plaintext secret, and the encryption key used to secure it,
               never leave the browser. Only an attack on your local browser or OS (e.g. keylogger)
               would potentially expose your secrets. This is the closest to bulletproof way to
               ensure no sensitive info ever leaves your browser unencrypted.
           </p>

           <p>The server component of this application is implemented in Ruby and you can view and audit
               the <a href="https://github.com/thesplit/thesplit" target="_blank">source code</a>.</p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
          <h4>Encrypted Vault Database with Auto Expiring Access Tokens</h4>
          <p>All secret data is stored in a strongly encrypted
              <a href="https://www.hashicorp.com/blog/vault.html" target="_blank">Hashicorp Vault Database</a>,
              providing a strong second layer of encryption that wraps all of the client side encrypted
              secret ciphertext again. The vault is fully encrypted at rest and locks when stopped.</p>

              <p>The Vault is an AES encrypted data store that has extremely strong access controls and
              can only be unsealed by three separate Shamir's Secret Sharing key shares which can
              be held by three separate individuals. Each secret we store in the Vault is stored
              under its own access control token that allows access to only data associated with that
              token and nothing else. One token, even if revealed, cannot view the data of another.
              All tokens have strict ACL policies and have finite TTL expiration times which is the
              mechanism we use to enfore secret sharing one-time use and secret expiration.
              When the token TTL has expired, all data associated with that token is
              automatically, irrevocably, and instantly, destroyed. Token use-count restrictions
              and expiration TTL's cannot be overridden once set.</p>
              
              <p>If its gone, don't ask us to try to get it back. We can't. Ever.</p>
          </p>
        </div>

        <div class="col-md-6">
          <h4>One-Time Use</h4>
          <p>All secret ciphertext can be downloaded only once. This is strictly enforced by Vault.
              Once you retrieve the encrypted data representing a secret its access token is
              immediately and irrevocably revoked and all associated secret data is automatically
              destroyed instantly. One-time use protects you in several ways. You can delete a secret
              that was mistakenly posted by simply visiting it first. If your recipient is unable to
              access a secret that may be an indication that someone else had access to your secret
              URL and visited it first. Always confirm with your recipient that they were able to access
              the secret. Of course this also protects you from unintended subsequent sharing of the
              secret access URL as anyone who gets the URL later can retrieve nothing.</p>

          <p>This feature can also enable interesting use-cases. For example, if you want to share
              something publicly (like a beta invite code, that you only have one of),
              you can simply post the secret share URL on Twitter and be certain that one, and
              only one, person will get the code.
          </p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
          <h4>Round Trip Content Authentication</h4>
          <p>It is important that creators and recipients of secrets have confidence in the
              integrity of the secret data that was shared as it makes its way over the Internet.
              The NaCl encryption we use provides authenticated encryption, ensuring
              that the contents of the encrypted secret itself are unchanged. We also wanted
              to provide cryptographic authentication that the entire data payload, including
              the ciphertext of the secret, the scrypt salt, and secret box nonce, are
              shared with the server in such a way that we can cryptographically authenticate
              that the payload has not had even a single byte changed.               
          </p>
          <p>We tackle this using an HMAC over the data payload. A 10 byte BLAKE2s HMAC is calculated
              over the payload using a 32 byte secret HMAC key. The secret key is derived from the same
              random data that the NaCl encryption key is derived from using Scrypt. This ensures
              that only the creator, and the recipient of a URL containing the key, can cryptographically
              derive the key needed to authenticate the payload.
          </p>
          <p>Here is where it gets interesting, we use this HMAC value as the ID that is used in the
              URL to identify and retrieve a shared secret. This means that when your recipient
              receives the payload for a given ID/HMAC it can be verified locally. Since the HMAC
              is embedded in the URL you use to retrieve the secret it is also not possible to
              tamper with the payload without discovery. Even the slightest change would result
              in a failed HMAC authentication. These HMAC checks are performed every time a secret
              is retrieved and if they fail no secret will be returned. It is better to fail completely
              than to return potentially bad results. Of course NaCl also provides its own authentication
              so we have defense in depth for the integrity of your data.
          </p>
        </div>

        <div class="col-md-6">
          <h4>Blockchain Anchored</h4>
          <p>Every secret that is shared has a unique ID value which, as is explained in greater detail
              on this page, ensures the integrity of the data. We take some additional steps to protect
              your data and allow for verifiable data integrity by anchoring every secret to a Merkle Tree
              proof, the root of which is anchored to the Bitcoin Blockchain.
          </p>

          <p>Prior to submitting your encrypted secret payload to our servers, a 32 byte BLAKE2s hash of
              the ID is generated. This is what is provided to the server, and this server ID is what we
              actually use as the handle to store and retrieve your secret. This seemingly small step
              is important in that it helps prevent the server from knowing information about the ID
              embedded in your secret link. This ensures that an adversary who gains knowledge of the
              list of secret ID's stored on the server cannot reverse that ID and perform
              a global search of, for example, the public Twitter stream or Gmail, in an
              attempt to locate the secret link ID and the encryption key that is likely stored
              alongside it. Of course if that adversary can see a URL being shared for this domain
              and they are able to keep that for later use once they have a copy of the DB, then
              all is lost. This could be an argument for stripping out the ID and the key from the
              secret link and sharing those anonymous hex values over different channels and
              never mention this service when sharing them.</p>

            <p>Finally, the 'server ID' is hashed one more time with SHA256 and that value is stored
                on the Bitcoin Blockchain using the <a href="https://tierion.com/" target="_blank">Tierion Proof Engine</a>.
                The receipts from this service, which contain the Merkle Proof data needed to verify
                that a secret has in fact been stored on the Blockchain, in a BTC OP_RETURN transaction,
                with an associated timestamp for the transaction. We collaborated with the Tierion team and
                wrote the official <a href="https://github.com/grempe/tierion" target="_blank">Tierion Ruby Gem</a>
                to allow easy submission and verification of anchors.
            </p>

            <p>This may seem extreme, but it allows a sender, and their recipient, to verify with
                absolute certainty that the data integrity of their shared data is assured and
                that it can be proven that a secret was sent at a certain time. This 'notary' is
                absolutely immutable. This technique is also generally safe in that it is impossible to
                reveal any information about the original secret by examining the one-way hash chain.  
            </p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
          <h4>HTTPS (TLS) Everywhere</h4>
          <p>This site is protected by a TLS/SSL certificate and has been awarded
              an <a href="https://www.ssllabs.com/ssltest/analyze.html?d=thesplit.is&latest" target="_blank">A+ rating from SSLLABS.com</a>
              and an <a href="https://securityheaders.io/?q=thesplit.is&followRedirects=on" target="_blank">A rating from securityheaders.io</a>.              
          </p>
          <p>HTTP Strict Transport Security
              (<a href="https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security" target="_blank">HSTS</a>)
              is also used to ensure that all browser connections to the site are protected by forcing
              HTTP connections to be redirected to their HTTPS equivalent. The 'thesplit.is' domain has also been
              added to the <a href="https://hstspreload.appspot.com/?domain=thesplit.is" target="_blank">HSTS Pre-Load List</a> and
              is currently pending hard-coding into the HSTS lists for Google Chrome and other browsers.</p>
        </div>

        <div class="col-md-6">
          <h4>Content Security Policy</h4>
          <p>The server implements a <a href="https://en.wikipedia.org/wiki/Content_Security_Policy" target="_blank">Content Security Policy (CSP)</a>
          that helps prevent cross-site scripting (XSS), clickjacking and other code injection attacks resulting from execution of
          malicious content in a trusted web page context. This site's CSP prevents the loading of resources (images, CSS, JS, Fonts)
          from other domains.
          </p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
          <h4>Subresource Integrity (SRI)</h4>
          <p> <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity" target="_blank">Subresource Integrity</a>
          is a relatively new security feature offered in modern browsers that that enables
          browsers to verify that files they fetch (for example, from a CDN) are delivered
          without unexpected manipulation. It works by allowing you to provide a cryptographic
          hash that a fetched file must match. All Javascript and CSS files used by this website
          are served from the host server and are protected by SRI. If your browser supports it
          any protected files will refuse to load unless they match the SRI hash embedded in
          the page. This, along with TLS/HSTS helps prevent Man-In-The-Middle (MITM) attacks
          against the security code required to run this application.            
          </p>
        </div>

        <div class="col-md-6">
          <h4>Single Page Application</h4>
          <p>The web client for <a href="https://thesplit.is" target="_blank">thesplit.is</a> is a
          <a href="http://vuejs.org" target="_blank">Vue.js</a> Javascript single page application which
          communicates with our REST API server over a TLS connection. The number of API calls is kept
          very low and very little information of use to an attacker is sent over the wire. Only timestamps
          and already encrypted material is sent. Most importantly, the encryption key never leaves
          the sender or recipients browser. It is never transmitted to our servers. You'll also enjoy
          the performance of this single-page application which is pretty 'snappy'.
          </p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
          <h4>Open Source</h4>
          <p>This application is <a href="https://github.com/thesplit" target="_blank">open source</a> under the terms
          of the <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">GNU Affero General Public License v3</a>.
          This license requires that all changes, including those to an application accessed
          over the network, be made public under the same license. Most commits to the source
          code repository are signed with the PGP key of the author and can be independantly
          verified. The source code is provided in the spirit of transparency and openness
          and to allow the security related aspects of this code to be verified and audited.         
          </p>
        </div>

        <div class="col-md-6">
          <h4>Run Your Own</h4>
          <p><em><strong>IMPORTANT Security Note</strong></em> : While you can run your own instance
              you won't enjoy some of the infrastructure features and security protections
              that <a href="https://thesplit.is" target="_blank">thesplit.is</a> can offer:</p>
              
          <ul>
            <li><a href="https://hstspreload.appspot.com/?domain=thesplit.is" target="_blank">HTTP Strict Transport Security (HSTS)</a></li>
            <li><a href="http://dnsviz.net/d/thesplit.is/dnssec/" target="_blank">DNSSEC</a></li>
            <li><a href="https://www.ssllabs.com/ssltest/analyze.html?d=thesplit.is&latest" target="_blank">SSL LABS A+ rated TLS</a></li>
            <li><a href="https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity" target="_blank">Subresource Integrity (SRI)</a></li>
            <li><a href="https://en.wikipedia.org/wiki/Content_Security_Policy" target="_blank">Content Security Policy (CSP)</a></li>
            <li><a href="https://securityheaders.io/?q=thesplit.is&followRedirects=on" target="_blank">Security Headers</a></li>
            <li><a href="https://www.cloudflare.com/" target="_blank">Cloudflare Global CDN</a></li>
            <li><a href="https://en.wikipedia.org/wiki/IPv6">IPv6 Support</a></li>
          </ul>

          <p>You have no reason to trust us yet, and we understand that trust is earned. If you want to use
              this application, but don't yet feel all warm and fuzzy about sending your secrets to
              <a href="https://thesplit.is" target="_blank">thesplit.is</a>, encrypted or not, you can examine
              the source code and run your own instance of the application on Heroku, or wherever else you
              choose, under the terms of the <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License</a>.
              You'll have to setup and maintain several secure host servers but you are free
              (as in freedom) to do so. No support is provided by us for self-hosted installations.
          </p>

          <p>If you are a commercial organization interested in running an instance of this application
              within your own organization under a more permissive license please contact us for
              licensing terms.
          </p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
          <h4>No Advertising</h4>
          <p><a href="https://thesplit.is" target="_blank">thesplit.is</a> website displays no advertising. Our initial
          offering is free to use for all and we hope to generate income by providing premium features
          that respect the security and privacy of our users, and by seeking out code licensing opportunities.             
          </p>
        </div>

        <div class="col-md-6">
          <h4>No Tracking Scripts</h4>
          <p><a href="https://thesplit.is" target="_blank">thesplit.is</a> does not use any third-party tracking scripts
          which can compromise your privacy. We do capture some very basic information about site usage,
          which does not rely on personal information sharing, and which is only reported to our own
          servers. We don't share information with any third parties unless required by law and accompanied
          by a court order. Even in that case your secrets are safely encrypted with a key that only you and
          your recipient know.
          </p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
          <h4>Offshore .IS Domain</h4>
          <p>This site is served from a '.is' domain, which is the Top Level Domain
              for Iceland. That domain is registered with an Iceland based provider.
              Iceland provides an environment that offers some of the
              <a href="https://freedomhouse.org/report/freedom-net/2015/iceland">strongest protections</a>
              for free speech and against surveillance and government interference in the world.
          </p>
          <p>At the moment, only the domain is registered in Iceland, but with sufficient funding
              we hope to move all content hosting there as well which would put the site and its
              content beyond the reach of some of the most repressive regimes in the world.
          </p>
          <p>The thesplit.is domain has also been <a href="http://dnsviz.net/d/thesplit.is/dnssec/" target="_blank">fully secured with DNSSEC</a>.
          <a href="https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions" target="_blank">DNSSEC</a>, the DNS Security Extensions,
          uses cryptographic signatures to provide authentication of DNS data and prevent malicious
          manipulation of DNS results.</p>
        </div>
    </div>

  </div>
</template>