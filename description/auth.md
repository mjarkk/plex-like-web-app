# Authentication, Encryption and Passwords
For this project I wanted a good way to send important data to the user. Maybe this is not the best way to send data but I can always learn from those things

## Passwords
A password is hashed using pbkdf2 with a length of 1000 and 500 iterations I have dune 500 iterations because you can still generate it within a view seconds. I have chosen for a length of 1000 because the server will later use it to send encryption keys.

## How a user authentication
This was the most tricky part of the security section. On school we learn to send a password to the server but what if the server doesn't have a HTTPS connection. that's not good because you will literally send the password in plain text to the server also the user needs a key to decrypt data if you send that without a https connection it would have the same effect so I came up with this solution:
### #1 Request a encrypted decryption key
The client will request a decryption key with the username as post data. If the server has found the user it will encrypt the decryption key with the hashed password from the user and send that encrypted data to the user plus the salt from the user.
### #2 try to decrypt the key
On the moment the user gets the information it will start hashing it's just filled in password plus the salt it got from the server. when that's complete it will try to decrypt the decryption key from the server. If that fails means the user does not have the right password. If the decryption went well the user has a key to encrypt data to the server and decrypt the data from the server.
### #3 cookies
For some data the user can't check as fast as the server can send like movies. For those responses the server has "secure" cookies from where it can check if the user is real. This request is made by doing what the server gave to client only reverse so giving the server the encrypted key to check if you are logged in.
### Side note..
All the login things on the client side happen in a "webworker" I have dune this because hashing a password asks from a lot of performacne and it's dom blocking this means you can't interact with the page at those moments and all animation will hang.

## Encryption
Every response is encrypted with the key the server has and the user got from the login. This key is stored in the local storage.
