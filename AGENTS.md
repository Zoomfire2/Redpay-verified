<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Payment configuration and receipt handling

- Store the active RPC payment option on the existing `public_payment_settings` row, and reuse the existing `deposits` table plus private `receipts` bucket for pending receipt submissions; this keeps one source of truth and avoids duplicate payment storage.
