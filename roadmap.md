# Roadmap

- [x] Delete the six FLW_* secrets (FLW_BASE_URL, FLW_CLIENT_ID, FLW_CLIENT_SECRET, FLW_ENCRYPTION_KEY, FLW_REDIRECT_URL, FLW_WEBHOOK_URL)
- [x] Remove all Flutterwave references from the database (columns/tables/functions named flw_ or flutterwave)
- [x] Verify no Flutterwave references remain anywhere (code, schema, secrets)
- [ ] Add persistent admin-controlled normal/Flutterwave payment selection without changing normal checkout
- [ ] Route Flutterwave checkout through the supplied link and persist pending receipts against the user's deposit record
- [ ] Show pending confirmation after receipt submission; do not auto-confirm or issue an RPC code
- [ ] Let admins review submitted RPC receipts and validate the complete switched-payment flow
- [ ] Verify support chat and Buy RPC switch from saved Account A to Account B without showing stale details
