
<a id="0xff_transfer"></a>

# Module `0xff::transfer`



-  [Struct `CoinTransfer`](#0xff_transfer_CoinTransfer)
-  [Struct `DoNothing`](#0xff_transfer_DoNothing)
-  [Constants](#@Constants_0)
-  [Function `not_registered`](#0xff_transfer_not_registered)
-  [Function `transfer_coin`](#0xff_transfer_transfer_coin)
-  [Function `do_nothing`](#0xff_transfer_do_nothing)


<pre><code><b>use</b> <a href="">0x1::coin</a>;
<b>use</b> <a href="">0x1::event</a>;
<b>use</b> <a href="">0x1::signer</a>;
<b>use</b> <a href="">0x1::timestamp</a>;
</code></pre>



<a id="0xff_transfer_CoinTransfer"></a>

## Struct `CoinTransfer`



<pre><code>#[<a href="">event</a>]
<b>struct</b> <a href="transfer.md#0xff_transfer_CoinTransfer">CoinTransfer</a> <b>has</b> drop, store
</code></pre>



<a id="0xff_transfer_DoNothing"></a>

## Struct `DoNothing`



<pre><code>#[<a href="">event</a>]
<b>struct</b> <a href="transfer.md#0xff_transfer_DoNothing">DoNothing</a> <b>has</b> drop, store
</code></pre>



<a id="@Constants_0"></a>

## Constants


<a id="0xff_transfer_ENO_NOT_REGISTERED_COIN"></a>



<pre><code><b>const</b> <a href="transfer.md#0xff_transfer_ENO_NOT_REGISTERED_COIN">ENO_NOT_REGISTERED_COIN</a>: u64 = 0;
</code></pre>



<a id="0xff_transfer_not_registered"></a>

## Function `not_registered`



<pre><code><b>public</b> <b>fun</b> <a href="transfer.md#0xff_transfer_not_registered">not_registered</a>(reason: u64): u64
</code></pre>



<a id="0xff_transfer_transfer_coin"></a>

## Function `transfer_coin`



<pre><code><b>public</b> entry <b>fun</b> <a href="transfer.md#0xff_transfer_transfer_coin">transfer_coin</a>&lt;CoinType&gt;(from: &<a href="">signer</a>, <b>to</b>: <b>address</b>, amount: u64)
</code></pre>



<a id="0xff_transfer_do_nothing"></a>

## Function `do_nothing`



<pre><code><b>public</b> <b>fun</b> <a href="transfer.md#0xff_transfer_do_nothing">do_nothing</a>(from: <b>address</b>, value: u64)
</code></pre>
