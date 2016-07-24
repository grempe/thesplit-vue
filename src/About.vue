<template>
  <div id="about">

    <div class="columns">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <h4>About</h4>
          <p>Learn more about this site, how it works, how secure it is, and the answers to frequently asked questions.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What is this?</h5>
          <p>Its a tool that anyone can use to share secrets securely, without the need to trust anyone or anything else with their secret for even a moment.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Why did you build it?</h5>
          <p></p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Is it secure? - Short Answer</h5>
          <p>Yes.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Is it secure? - Longer Answer</h5>
          <p>Yes. This is an end-to-end, zero-knowledge, secret sharing system that
              uses modern cryptography to secure your secrets. Secrets, the keys to
              unlock them, never leave your local machine without being encrypted first.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Has the code undergone a third-party security review?</h5>
          <p>No, the code has not yet been subjected to a rigorous security audit. It
            has however been circulated and informally reviewed by security experts and
            the code is open source for anyone to review at any time.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>How big can my secret be?</h5>
          <p>Currently, the Base64 encrypted secret data can be up to 65,536 Bytes.
              Base64 imposes about 33% overhead on your encrypted data so your secret
              will have to be smaller than that in practice. NaCl only adds
              about 16 Bytes to the size of your plain-text secret so the encryption
              overhead is minimal when compared to the Base64 encoding.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Can I share images or files?</h5>
          <p>Currently, only UTF-8 text can be shared. If you can encode your file to UTF-8
              it can be shared, for example if you Base64 encode it a tar or zip file. Make
              sure your recipient knows what to do with your encoded file.
          </p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Can I share files I encrypted myself?</h5>
          <p>Yes, good idea! As long as the encrypted file can be serialized to UTF-8 or ASCII text, such
              as with ASCII armored OpenPGP encrypted files, you should be fine. Make sure your
              recipient knows what to do with your encrypted file.
          </p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Do secrets expire?</h5>
          <p>Yes, they encrypted data record currently expires exactly 30 days after
              creation. When the file expires it is automatically deleted.
          </p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What kind of cryptography is used to encrypt my secrets?</h5>
          <p>All shared secret data is encrypted using the
              <a href="https://tweetnacl.js.org/#/">TweetNaCl.js</a> encryption library.
              More specifically the Secretbox (XSalsa20 stream cipher and Poly1305
              one-time authenticator) secret-key authenticated encryption construct
              is used with a 24 Byte Nonce and a 32 Byte random key. This is
              considered by experts to be state of the art encryption in 2016.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What do you mean by 'end-to-end encrypted'?</h5>
          <p>End-to-end encryption is the practice of encrypting your content locally
              so that no plain-text material ever leaves your local environment before
              it hits the Internet. Only the recipient, who knows your encryption key,
              can decrypt the content also in her local environment.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What do you mean by 'zero-knowledge'?</h5>
          <p>We do not collect any user identifiable information, and you secrets
              are shared and stored in such a way that neither the sender or recipient
              can be identified without the ability to actually monitor the network
              traffic to and from our servers.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What is this 'ID' you keep mentioning?</h5>
          <p>The ID is the unique identifier used to store your secret data in our database. Knowledge of
              the ID is required to request a copy of the encrypted secret from our API. The ID is
              actually a 16 Byte Base32 encoded (human and URL friendly) BLAKE2s HMAC with the HMAC key
              being a 'pepper', or known value. With rate-limited API, and a 16 Byte (128 bit) ID it
              is <a href="http://betterexplained.com/articles/the-quick-guide-to-guids/" target="_blank">generally
              considered infeasible for someone to guess the ID</a> for any records in the DB.
              Especially when you consider that ID's and their data expire. Even if it were possible
              to guess, the attacker would only receive the encrypted data which
              is useless without knowing the 32 Byte (256 bit) encryption key for that ciphertext
              which is a *much* harder nut to crack.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Couldn't an attacker guess the ID and retrieve my encrypted secrets?</h5>
          <p>If they could guess the ID, which is highly unlikely in a billion lifetimes,
              they could retrieve your encrypted secret data and try to crack it. There are
              <a href="https://www.xkcd.com/538/" target="_blank">much easier ways to get at your secrets</a>.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What is this 'Key' you keep mentioning?</h5>
          <p>When you encrypt something using symmetric key cryptography you generally
              need a 'key' and a 'nonce' along with the message you want to encrypt. In our
              case, the key is a 32 Byte (256 bit) random number generated by the
              Cryptographically Secure Pseudo Random Number Generator (CSPRNG) built into your browser.
              Cracking a key of this strength is <a href="http://crypto.stackexchange.com/questions/1145/how-much-would-it-cost-in-u-s-dollars-to-brute-force-a-256-bit-key-in-a-year" target="_blank">considered</a> <a href="http://security.stackexchange.com/questions/6141/amount-of-simple-operations-that-is-safely-out-of-reach-for-all-humanity/6149#6149" target="_blank">impossible</a>.
              It would be much easier to hack your computer where the secrets still exist in plain-text. 
          </p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Couldn't an attacker who knows the ID guess my secret key in an online attack?</h5>
          <p>If they know the ID of your secret they could only obtain the encrypted cipher-text. This
              would also likely become known because the act of their retrieval would also destroy the
              secret data, and your intended recipient would let you know they didn't receive the
              message. They could not guess your ID in an online attack due to the combination of
              rate-limiting and the massive problem of guessing a 128 bit ID value.
          </p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Couldn't an attacker who obtains a copy of the database of secrets brute-force guess the keys for those secrets in an offline attack?</h5>
          <p><a href="http://crypto.stackexchange.com/questions/1145/how-much-would-it-cost-in-u-s-dollars-to-brute-force-a-256-bit-key-in-a-year">No.</a> Not unless they are aware of an exploit for the cryptography used. There are currently no such known exploits for NaCl SecretBox crypto.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Are my secrets protected in transit using SSL/TLS?</h5>
          <p>Yes.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Are my secrets protected at rest?</h5>
          <p>Yes, they are protected by strong encryption and strong random keys. The
              server never knows the value of the encryption key so it can't be
              compromised by someone with a copy of our secrets DB.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Are requests to the server rate-limited?</h5>
          <p>Yes. The current limit is 100 requests per minute for any single IP address.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What technology stack do you use?</h5>
          <p>
            <ul>
              <li>Sinatra (Ruby)</li>
              <li>Redis</li>
              <li>Vue.js (Client)</li>
            </ul>
          </p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What cryptographic libraries do you use on the client side?</h5>
          <p>
            <ul>
              <li><a href="https://tweetnacl.js.org/#/" target="_blank">TweetNaCl.js</a></li>
              <li><a href="https://github.com/dchest/blake2s-js" target="_blank">BLAKE2s</a></li>
              <li><a href="https://github.com/cryptocoinjs/scryptsy" target="_blank">scryptsy</a></li>
            </ul>
          </p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What cryptographic libraries do you use on the server side?</h5>
            <ul>
              <li><a href="https://github.com/cryptosphere/rbnacl" target="_blank">RbNaCl (Ruby + C libsodium)</a></li>
              <li><a href="https://github.com/franckverrot/blake2" target="_blank">BLAKE2 (Ruby + C reference lib)</a></li>
            </ul>
          <p></p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Could an attacker compromise your logs and learn something?</h5>
          <p>Currently there is minimal logging of requests to the server which
              includes the user agent and the IP address of the requestor. These logs
              are currently kept for 7 days.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Do you collect user data?</h5>
          <p>We do not collect or store any user data other than the data required to
              restore a secret. There are no usernames, passwords, IP addresses, or
              other Personally Identifyable Information (PII) in the database.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Do you provide any user data to third-parties?</h5>
          <p>No, we don't have any user data.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Do you use analytics services?</h5>
          <p>No.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Do you store any aggregate statistical information about secrets shared?</h5>
          <p>Yes. We currently store simple non-identifiable counters of things like total
              secrets shared, total secrets retrieved, etc.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What kind of database do you use to store my data?</h5>
          <p>All data is currently stored in a Redis in-memory data store.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What data is stored in the database?</h5>
          <p>Currently, only the following is stored in a data record for a secret:</p>
          <ul>
            <li>Base64 encoded 32 Byte Scrypt salt</li>
            <li>Base64 encoded 24 Byte NaCl SecretBox Nonce</li>
            <li>Base64 encoded NaCl SecretBox Ciphertext</li>
            <li>Base32 encoded 16 Byte BLAKE2s HMAC of the previous values, used as the ID</li>
          </ul>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>What could an attacker do with the data stored in the database?</h5>
          <p>Not much. It is considered infeasible (see other answers here) to crack
              the 32 Byte (256 bit) encryption keys on the data. However, they would be
              able to guess the length of secrets that are stored. If this is a concern
              you can always pad your secret with any data you choose.
          </p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Could an attacker change the contents of my secret?</h5>
          <p>No, not unless they can also change the code that runs the site. The contents of your
              secret, along with the other data we store, are hashed using BLAKE2s HMACs before the client
              submits it. The hash of that data is also the ID used to retrieve your encrypted data. This
              HMAC is verified to is verified on submission to the API, on retrieval from the API, and
              again by the client before it is decrypted.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Can I review the source code for security flaws?</h5>
          <p>Yes. See <a href="https://github.com/thesplit">github.com/thesplit</a></p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Can I run my own copy of this application for personal use?</h5>
          <p>Yes, for non-commercial personal use, when offered free of charge and in accordance with the terms of the license.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Can I run my own copy of this application for commercial use?</h5>
          <p>Please contact us for licensing information and pricing for commercial use.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>I think I found a bug, how do I report it?</h5>
          <p>We welcome your <a href="https://github.com/thesplit/thesplit-vue/issues">bug report</a>.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>I think I found a security defect, how do I report it?</h5>
          <p>You can <a href="https://www.rempe.us/contact/">send an encrypted security report</a>.</p>
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
