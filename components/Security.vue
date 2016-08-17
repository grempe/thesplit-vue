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

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h4>Security</h4>
          <h4>This security design of this application is guided by a single overarching
              principle; that the security and privacy of its users, and the information they
              want to share, is paramount. All other considerations are secondary. Here are
              some of the key security goals.</h4>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        
        <div class="column col-5">
          <h4>End-To-End Encryption</h4>
          <p>All user content is encrypted locally in the browser using before being
              transmitted to the server for sharing. All data is encrypted with
              <a href="http://tweetnacl.cr.yp.to/index.html" target="_blank">TweetNaCl</a>/
              <a href="http://nacl.cr.yp.to" target="_blank">NaCl</a> compatible
              Secret Key Authenticated Encryption (XSalsa20-Poly1305). Only the person who
              created a secret, and their chosen recipient, ever has possession of the
              secret keys needed to decrypt or authenticate it.</p>

          <p>A secure Random Number Generator (CSPRNG) generates 32 byte (256 bit)
              one-time use random keys. This 32 byte key material is then stretched,
              using the <a href="https://en.wikipedia.org/wiki/Scrypt" target="_blank">Scrypt Key Derivation Function (KDF)</a>,
              to 64 Bytes. The first 32 Bytes of this stretched key is used as the symetric key
              for an NaCl Secret Box, while the second 32 Bytes is used as a BLAKE2s HMAC key to
              authenticate the entire server payload. The following security libraries are used
              in the client.              
          </p>
          <p>
            <ul>
              <li><a href="https://tweetnacl.js.org/#/" target="_blank">TweetNaCl.js</a></li>
              <li><a href="https://github.com/dchest/blake2s-js" target="_blank">BLAKE2s</a></li>
              <li><a href="https://github.com/cryptocoinjs/scryptsy" target="_blank">scryptsy</a></li>
            </ul>
          </p>
        </div>

        <div class="column col-5">
          <h4>Zero-Knowledge Server</h4>
          <p>The server, even if fully compromised, cannot reveal secrets it never had.
              Other secret sharing applications submit the user secret data itself to the server
              and depend on the server to perform all encryption operations and return the
              key materials and URL's needed for sharing. Even if the server does not retain this
              sensitive information during normal operation, or takes measures to erase it from memory,
              the fact is that it requires the user to trust that the server has not been
              compromised. Whether compromised by criminals, law enforcement carrying out
              surveillance under a legal court order, or a malicious server admin, it is still
              possible. In these situations the user would have no way of knowing their data
              was compromised.</p>

           <p>We address this concern by assuming in our threat model that the server is
              always compromised and cannot be trusted with secrets, or the keys needed
              to unlock them. Only fully encrypted data, or nonces and salts that can safely
              be made public, will ever be shared with the server by the client.
           </p>

           <p>The server is implemented in Ruby and you can view the <a href="https://github.com/thesplit/thesplit" target="_blank">source code</a>.</p>
        </div>

        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>

        <div class="column col-5">
          <h4>Auto Expiring</h4>
          <p>All secrets shared have an associated Time To Live (TTL). By default this is
              24 hours. When the TTL has expired, the content is automatically, irrevocably,
              and instantly, deleted. Don't ask us to get it back, we can't.            
          </p>
        </div>

        <div class="column col-5">
          <h4>One-Time Use</h4>
          <p>All secrets shared can be accessed only once. This is strictly enforced. Once you retrieve
              the encrypted data representing a secret it is immediately and irrevocably deleted from
              our servers. If you have the ID for a secret, but enter the wrong encryption key even once
              you will not be able to try again. This protects you in several ways. You can delete a secret
              that was mistakenly posted by simply visiting it first, and if your recipient is unable to
              access a secret that may be a good indication that someone else had access to your secret
              URL and visited first. Always confirm with your recipient that they were able to access
              the secret you sent. Of course this also protects you from unintended sharing of the
              secret access URL since only one person can access it.</p>

          <p>This can also be used to your advantage when sharing something with limited availablity
             like a beta invite. You can post it on Twitter and you and anyone else who tries it
             will know that only one person can get the secret code.
          </p>
        </div>

        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>

        <div class="column col-5">
          <h4>Round Trip Content Authentication</h4>
          <p>It is important that creators and recipients of secrets have confidence in the
              integrity of the secret data that was shared as it makes its way over the Internet.
              The NaCl encryption we use provides authenticated encryption, ensuring
              that the contents of the encrypted secret itself are unchanged. We also wanted
              to provide cryptographic authentication that the entire data payload, including
              the cyphertext of the secret, are shared with the server in such a way that we can
              cryptographically authenticate that payload has not had even a single byte changed.               
          </p>
          <p>We tackle this using an HMAC over the data payload. A 16 byte BLAKE2s HMAC is calculated
              over the payload using a 32 byte secret key. The secret key is derived from the same
              random data that the NaCl encryption key is derived from using Scrypt. This ensures
              that only the creator, and the recipient of a URL containing the key, can cryptographically
              authenticate the payload.
          </p>
          <p>Here is where it gets interesting, the ID that is used in the URL to retrieve the secret
              is actually the same HMAC value! This means that when your recipient receives the payload
              from a given ID/HMAC only she can authenticate it against that same HMAC. So it should
              not be possible to alter the content of the payload on the server without detection since
              even the slightest change would result in a failed HMAC authentication.

          </p>
        </div>

        <div class="column col-5">
          <h4>Offshore .IS Domain</h4>
          <p>This site is served from a '.is' domain, which is the Top Level Domain
              for Iceland. That domain is registered with an Iceland based provider.
              Iceland provides an environment that offers some of the
              <a href="https://freedomhouse.org/report/freedom-net/2015/iceland">strongest protections</a>
              for free speach and against surveillance and government interference in the world.
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

        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>

        <div class="column col-5">
          <h4>HTTPS (TLS) Everywhere</h4>
          <p>This site is protected by a TLS/SSL certificate and has been awarded
              an <a href="https://www.ssllabs.com/ssltest/analyze.html?d=thesplit.is&latest" target="_blank">A+ rating from SSLLABS.com</a>
              and an <a href="https://securityheaders.io/?q=thesplit.is&followRedirects=on" target="_blank">A rating from securityheaders.io</a>.              
          </p>
          <p>HTTP Strict Transport Security
              (<a href="https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security" target="_blank">HSTS</a>)
              is also used to ensure that all browser connections to the site are protected by forcing
              HTTP connections to be redirected to their HTTPS equivalent. The 'thesplit.is' domain has also been
              submitted to the <a href="https://hstspreload.appspot.com/?domain=thesplit.is" target="_blank">Chrome HSTS Pre-Load List</a> and is currently
              pending hard-coding into the HSTS lists for Google Chrome and other browsers.</p>
        </div>

        <div class="column col-5">
          <h4>Content Security Policy</h4>
          <p>The server implements a <a href="https://en.wikipedia.org/wiki/Content_Security_Policy" target="_blank">Content Security Policy (CSP)</a>
          that helps prevent cross-site scripting (XSS), clickjacking and other code injection attacks resulting from execution of
          malicious content in a trusted web page context. This site's CSP prevents the loading of resources (images, CSS, JS, Fonts)
          from other domains.
          </p>
        </div>

        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>

        <div class="column col-5">
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

        <div class="column col-5">
          <h4>Single Page Application</h4>
          <p>The web client for <a href="https://thesplit.is" target="_blank">thesplit.is</a> is a
          <a href="http://vuejs.org" target="_blank">Vue.js</a> Javascript single page application which
          communicates with our REST API server. There is no information leaked about
          your secret from this application to the server and you can monitor the very
          limited calls made to the server API using your browser dev tools.
          </p>
        </div>

        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>

        <div class="column col-5">
          <h4>Open Source</h4>
          <p>This application is <a href="https://github.com/thesplit" target="_blank">open source</a> under the terms
          of the GNU Affero General Public License v3. This license requires that all changes, including
          those to an application accessed over the network, be made public under the same license.
          Most commits to the source code repository are signed with the PGP key of the author
          and can be verified. The source code is provided in the spirit of transparency and openness
          and to allow the security related aspects of this code to be verified and audited.         
          </p>
        </div>

        <div class="column col-5">
          <h4>Run Your Own</h4>
          <p><em><strong>IMPORTANT Security Note</strong></em> : If you run your own instance you will not have many of
              the security protections that <a href="https://thesplit.is" target="_blank">thesplit.is</a>
              provides such as IPv6 support, HSTS, DNSSEC, A+ HTTPS support, offshore DNS, and others.</p>

          <p>You have no reason to trust us yet. We understand that trust is earned. If you want to use
              this application, but don't yet feel warm and fuzzy about sending your secrets to
              <a href="https://thesplit.is" target="_blank">thesplit.is</a>, encrypted or not, you can examine the source
              code and run your own instance of the application on Heroku, or wherever you choose, under
              the terms of the open source license. We believe so strongly in this we even made a
              <a href="https://github.com/thesplit/thesplit/blob/master/README.md" target="_blank">Heroku Button</a>
              to let you do a one-click install of the whole application which will spin up a new
              instance in minutes.
          </p>

          <p>If you are a commercial organization interested in running an instance within your own
              organization please contact us for licensing terms.
          </p>
        </div>

        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>

        <div class="column col-5">
          <h4>No Advertising</h4>
          <p><a href="https://thesplit.is" target="_blank">thesplit.is</a> website displays no advertising. Our initial
          offering is free to use for all and we hope to generate income by providing premium features
          that respect the security and privacy of our users, and by seeking out code licensing opportunities.             
          </p>
        </div>

        <div class="column col-5">
          <h4>No Tracking Scripts</h4>
          <p><a href="https://thesplit.is" target="_blank">thesplit.is</a> does not use any third-party tracking scripts
          which can compromise your privacy. We do capture some very basic information about site usage,
          which does not rely on personal information sharing, and which is only reported to our own
          servers. We don't share information with any third parties unless required by law with
          a court order, but even then your secrets are safely encrypted with a key that only you know.
          </p>
        </div>

        <div class="column col-1"></div>
    </div>

  </div>
</template>

<script>
export default {}
</script>

<style>
</style>
