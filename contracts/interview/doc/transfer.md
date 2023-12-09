
<a id="0xff_transfer"></a>

# Module `0xff::transfer`



-  [Struct `CoinTransfer`](#0xff_transfer_CoinTransfer)
-  [Constants](#@Constants_0)
-  [Function `transfer_coin`](#0xff_transfer_transfer_coin)


<pre><code><b>use</b> <a href="">0x1::coin</a>;
<b>use</b> <a href="">0x1::error</a>;
<b>use</b> <a href="">0x1::event</a>;
<b>use</b> <a href="">0x1::signer</a>;
<b>use</b> <a href="">0x1::timestamp</a>;
</code></pre>



<a id="0xff_transfer_CoinTransfer"></a>

## Struct `CoinTransfer`



<pre><code>#[<a href="">event</a>]
<b>struct</b> <a href="transfer.md#0xff_transfer_CoinTransfer">CoinTransfer</a> <b>has</b> drop, store
</code></pre>



<a id="@Constants_0"></a>

## Constants


<a id="0xff_transfer_ENO_NOT_REGISTERED"></a>



<pre><code><b>const</b> <a href="transfer.md#0xff_transfer_ENO_NOT_REGISTERED">ENO_NOT_REGISTERED</a>: u64 = 0;
</code></pre>



<a id="0xff_transfer_transfer_coin"></a>

## Function `transfer_coin`



<pre><code><b>public</b> entry <b>fun</b> <a href="transfer.md#0xff_transfer_transfer_coin">transfer_coin</a>&lt;CoinType&gt;(from: &<a href="">signer</a>, <b>to</b>: <b>address</b>, amount: u64)
</code></pre>
