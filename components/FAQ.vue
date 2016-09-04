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
  <div id="FAQ">

    <h4><span class="fa fa-question-circle-o fa-fw fa-lg"></span>Frequently Asked Questions</h4>
    <br>
    <div class="row" v-for="faq in frequentlyAskedQuestions | orderBy 'cat'">
      <div class="col-md-12">
        <span class="label label-default">{{ faq.cat }}</span>&nbsp;<strong>{{ faq.q }}</strong>
        <!-- triple mustache to allow unsafe raw HTML -->
        <div>{{{ faq.a }}}</div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data () {
    return {
      frequentlyAskedQuestions: [
        {
          cat: 'general',
          q: "What is this?",
          a: "<p>Its a tool that anyone can use to share secrets securely, without the need to trust anyone or anything else with their secret for even a moment.</p>"
        },
        {
          cat: 'general',
          q: "Why did you build it?",
          a: "<p>Because we all need a way to share secrets now and then and its important that it be just as easy as sending the secret in an email. I've tried lots of similar applications before, but none of them provided true end-to-end encryption which is the security  bar that must be met in todays security environment.</p>"
        },
        {
          cat: 'security',
          q: "Is it secure?",
          a: "<p><a href='/#!/security'>Yes. See our security page.</a></p>"
        },
        {
          cat: 'security',
          q: "Is it secure? Longer answer.",
          a: "<p>Yes. This is an end-to-end, zero-knowledge, secret sharing system that uses modern cryptography to secure your secrets. Secrets, and the keys to unlock them, never leave your local machine without being encrypted first.</p><p>See the <a href='/#!/security'>security page</a> for more info.</p>"
        },
        {
          cat: 'security',
          q: "Has the code undergone a third-party security review?",
          a: "<p>No, the code has not yet been subjected to a professional security audit. It has however been circulated and reviewed by security experts and the code is open source for anyone to review at any time.</p>"
        },
        {
          cat: 'general',
          q: "How big can my secret be?",
          a: "<p>Currently, the total Base64 encrypted secret data can be up to 65,536 bytes in length. Base64 imposes about 33% overhead on your encrypted data so your secret will have to be smaller than that in practice. Keep an eye on the meter when you are entering your secret to get an idea of how big your secret can be.</p>"
        },
        {
          cat: 'general',
          q: "Can I share images or files?",
          a: "<p>Currently, only UTF-8 text can be shared. If you can encode your file to UTF-8 it can be shared, for example if you Base64 encode a tar or zip file. Make sure your recipient knows what to do with your encoded file since it won't be automatically handled on the receiving end.</p>"
        },
        {
          cat: 'general',
          q: "Can I share files I encrypted myself?",
          a: "<p>Yes, good idea! As long as the encrypted file can be serialized to UTF-8 or ASCII text, such as with ASCII armored OpenPGP encrypted files, you should be fine. Make sure your recipient knows what to do with your encrypted file.</p>"
        },
        {
          cat: 'general',
          q: "Do secrets expire?",
          a: "<p>Yes, the encrypted data record currently expires exactly 24 hours after creation. When the file expires it is automatically deleted.</p>"
        },
        {
          cat: 'security',
          q: "What kind of cryptography is used to encrypt my secrets?",
          a: "<p>After generating a one-time use 16 byte (128 bit) random key, and stretching that key with the scrypt key derivation function, all shared secret data is encrypted using the <a href='https://tweetnacl.js.org/#/' target='_blank'>TweetNaCl.js</a> encryption library. More specifically the Secretbox (XSalsa20 stream cipher and Poly1305 one-time authenticator) secret-key authenticated encryption construct is used with a 24 Byte Nonce and the 32 Byte (256 bit) key which was derived from the random key. On the server side all data is stored in an instance of the Hashicorp Vault Database, which is an AES encrypted data store protected by a strong access control layer with enforced use-limits, access control lists (ACL's), and Time To Live values (TTL's). This is state of the art security.</p>"
        },
        {
          cat: 'security',
          q: "What do you mean by 'end-to-end encrypted'?",
          a: "<p>End-to-end encryption is the practice of encrypting your content locally so that no plain-text material ever leaves your local environment before it hits the Internet. Only the recipient, who knows your encryption key, can decrypt the content in her local environment.</p>"
        },
        {
          cat: 'security',
          q: "What do you mean by 'zero-knowledge'?",
          a: "<p>We do not collect any user identifiable information, and you secrets are shared and stored in such a way that neither the sender or recipient can be identified without the ability to actually monitor the network traffic to and from our servers.</p>"
        },
        {
          cat: 'security',
          q: "Couldn't an attacker guess the ID and retrieve my encrypted secrets?",
          a: "<p>If they could guess the ID, which is highly unlikely before the sun burns out, they could retrieve your encrypted secret data and try to crack it. It would be much easier for an attacker to steal the whole database and all the encrypted secrets. However, breaking any of the encrypted secrets in the DB is a task which is considered extremely difficult, if not impossible, due to the use of a strong random encryption key, passed through the slow scrypt key derivation function, resulting in a 32 byte encryption key.</p><p>There are <a href='https://www.xkcd.com/538/' target='_blank'>much easier ways to get a hold of your encrypted secrets</a>.</p>"
        },
        {
          cat: 'security',
          q: "What is this 'Key' you keep mentioning?",
          a: "<p>When you encrypt something using symmetric key cryptography you generally need a 'key' and a 'nonce' along with the message you want to encrypt. In our case, the key is a 32 Byte (256 bit) random number derived from a random value created by the Cryptographically Secure Pseudo Random Number Generator (CSPRNG) built into your browser. Cracking a key of this strength is <a href='http://crypto.stackexchange.com/questions/1145/how-much-would-it-cost-in-u-s-dollars-to-brute-force-a-256-bit-key-in-a-year' target='_blank'>considered</a> <a href='http://security.stackexchange.com/questions/6141/amount-of-simple-operations-that-is-safely-out-of-reach-for-all-humanity/6149#6149' target='_blank'>impossible</a>. It would be much easier to hack your computer where the secrets still exist in plain-text.</p>"
        },
        {
          cat: 'security',
          q: "Couldn't an attacker who knows the ID guess my secret key in an online attack?",
          a: "<p>If they know the ID of your secret they could only obtain the encrypted cipher-text. This would also likely become known because the act of their retrieval would also destroy the secret data, and your intended recipient would let you know they didn't receive the message. They could not guess your ID in an online attack due to the combination of rate-limiting and the massive problem of guessing such a large ID value.</p>"
        },
        {
          cat: 'security',
          q: "Couldn't an attacker who obtains a copy of the database of secrets brute-force guess the keys for those secrets in an offline attack?",
          a: "<p><a href='http://crypto.stackexchange.com/questions/1145/how-much-would-it-cost-in-u-s-dollars-to-brute-force-a-256-bit-key-in-a-year' target='_blank'>No.</a> Not unless they are aware of an exploit for the cryptography used. There are currently no such known exploits for NaCl SecretBox crypto. They would also have to break the security of our encrypted Vault DB which wraps all data behind AES encryption.</p>"
        },
        {
          cat: 'security',
          q: "Are my secrets protected in transit using SSL/TLS?",
          a: "<p>Yes, they are protected by strong encryption and strong random keys. The server never knows the value of the encryption key so it can't be compromised by someone with a copy of our secrets DB. All security data is stored in a Vault DB which encrypts all of its contents in use and at rest and can only be unlocked by three or more keys of a Shamir's Secret Sharing key set.</p> <p>See our <a href='/#!/security'>security page</a>.</p>"
        },
        {
          cat: 'general',
          q: "Are requests to the server rate-limited?",
          a: "<p>Yes. The current limit is 100 requests per minute for any IP address.</p>"
        },
        {
          cat: 'general',
          q: "What technology stack do you use?",
          a: "<p><ul><li>Sinatra (Ruby API)</li><li>Hashicorp Vault DB</li><li>Redis</li><li>Vue.js (Client Single Page App)</li></ul></p>"
        },
        {
          cat: 'security',
          q: "Could an attacker compromise your logs and learn something?",
          a: "<p>Currently there is very minimal logging of requests to the server which includes the user agent and the IP address of the requestor. These logs are currently kept for 7 days before being automatically discarded.</p>"
        },
        {
          cat: 'privacy',
          q: "Do you collect user data?",
          a: "<p>We do not collect or store any user data other than the data required to restore a secret. There are no usernames, passwords, IP addresses, or other Personally Identifyable Information (PII) in our database.</p>"
        },
        {
          cat: 'privacy',
          q: "Do you provide any user data to third-parties?",
          a: "<p>No. No personally identifiable user data is asked for or retained.</p>"
        },
        {
          cat: 'privacy',
          q: "Do you use third-party analytics services?",
          a: "<p>No. The potential security and privacy compromise is not worth the information provided.</p>"
        },
        {
          cat: 'privacy',
          q: "Do you store any aggregate statistical information about secrets shared?",
          a: "<p>Yes. Currently, simple non-identifiable counters of things like total secrets created and retrieved are stored.</p>"
        },
        {
          cat: 'security',
          q: "What kind of database do you use to store my data?",
          a: "<p>All data is currently stored in a <a href='https://www.hashicorp.com/blog/vault.html' target='_blank'>Hashicorp Vault Database</a> alongside a Redis in-memory data store for non security sensitive data.</p>"
        },
        {
          cat: 'security',
          q: "What data is stored in the database?",
          a: "<p>Currently, only the following information is stored in the data record for an encrypted secret:</p><ul><li>Base64 encoded 32 Byte Scrypt salt</li><li>Base64 encoded 24 Byte NaCl SecretBox Nonce</li><li>Base64 encoded NaCl SecretBox Ciphertext</li><li>(ID) Base32 encoded 16 Byte BLAKE2s HMAC of the previous values.</li><li>Created At Timestamp</li><li>Expires At Timestamp</li></ul>"
        },
        {
          cat: 'security',
          q: "What could an attacker do with the data stored in the database?",
          a: "<p>Likely, not much. It is considered infeasible to crack the 32 Byte (256 bit) random encryption keys that result from being 'stretched' with Scrypt, or defeat the encryption directly. However, an attacker would be able to determine the length of secrets that are stored. If this is a concern you can pad your secret to achieve the length you desire. The salt and nonce values are also present but are of little use without the encryption key.</p>"
        },
        {
          cat: 'security',
          q: "Could an attacker change the contents of my secret?",
          a: "<p>No, not likely. The contents of your secret, along with the other data stored, are hashed with a BLAKE2s HMACs and a Scrypt stretched secret key before the client submits it. The HMAC is also the ID used to retrieve your encrypted data. This HMAC is verified again by the client before any decryption operation is attempted. The NaCl authenticated encryption system used also prevents modification of the encrypted cyphertext without detection and failure.</p>"
        },
        {
          cat: 'security',
          q: "Can I review the source code for security flaws?",
          a: "<p>Yes. See <a href='https://github.com/thesplit' target='_blank'>github.com/thesplit</a></p>"
        },
        {
          cat: 'general',
          q: "Can I run my own copy of this application for personal use?",
          a: "<p>Yes, for non-commercial personal use, when offered free of charge and in accordance with the terms of the license.</p><p>See <a href='https://github.com/thesplit/thesplit' target='_blank'>github.com/thesplit/thesplit</a> for instructions.</p>"
        },
        {
          cat: 'general',
          q: "Can I run my own copy of this application within my company for commercial use?",
          a: "<p>Please contact for licensing information for commercial use.</p>"
        },
        {
          cat: 'general',
          q: "I think I found a bug, how do I report it?",
          a: "<p>We welcome your <a href='https://github.com/thesplit/thesplit-vue/issues' target='_blank'>bug report</a>.</p>"
        },
        {
          cat: 'security',
          q: "I think I found a security bug, how do I report it?",
          a: "<p>Send a PGP encrypted email, encrypted with the key ID 0xA4A288A3BECCAE17. Read more about contacting me securely <a href='https://www.rempe.us/keys/' target='_blank'>here</a>.</p>"
        },
      ]
    }
  }
}
</script>
