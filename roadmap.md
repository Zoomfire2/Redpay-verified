# Roadmap

- [x] Delete the six FLW_* secrets (FLW_BASE_URL, FLW_CLIENT_ID, FLW_CLIENT_SECRET, FLW_ENCRYPTION_KEY, FLW_REDIRECT_URL, FLW_WEBHOOK_URL)
- [x] Remove all Flutterwave references from the database (columns/tables/functions named flw_ or flutterwave)
- [x] Verify no Flutterwave references remain anywhere (code, schema, secrets)
- [x] Add persistent admin-controlled normal/Flutterwave payment selection without changing normal checkout
- [x] Route Flutterwave checkout through the supplied link and persist pending receipts against the user's deposit record
- [x] Show pending confirmation after receipt submission; do not auto-confirm or issue an RPC code
- [x] Add admin review access for submitted RPC receipts
- [ ] Validate the complete switched-payment and receipt flow — blocked until an authenticated preview session is available
- [ ] Verify support chat and Buy RPC switch from saved Account A to Account B without showing stale details — blocked until an authenticated preview session is available
