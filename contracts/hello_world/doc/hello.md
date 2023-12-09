
<a id="0xef_message"></a>

# Module `0xef::message`



-  [Resource `MessageHolder`](#0xef_message_MessageHolder)
-  [Struct `MessageChange`](#0xef_message_MessageChange)
-  [Constants](#@Constants_0)
-  [Function `get_message`](#0xef_message_get_message)
-  [Function `set_message`](#0xef_message_set_message)


<pre><code><b>use</b> <a href="">0x1::error</a>;
<b>use</b> <a href="">0x1::event</a>;
<b>use</b> <a href="">0x1::signer</a>;
<b>use</b> <a href="">0x1::string</a>;
</code></pre>



<a id="0xef_message_MessageHolder"></a>

## Resource `MessageHolder`



<pre><code><b>struct</b> <a href="hello.md#0xef_message_MessageHolder">MessageHolder</a> <b>has</b> key
</code></pre>



<a id="0xef_message_MessageChange"></a>

## Struct `MessageChange`



<pre><code>#[<a href="">event</a>]
<b>struct</b> <a href="hello.md#0xef_message_MessageChange">MessageChange</a> <b>has</b> drop, store
</code></pre>



<a id="@Constants_0"></a>

## Constants


<a id="0xef_message_ENO_MESSAGE"></a>

There is no message present


<pre><code><b>const</b> <a href="hello.md#0xef_message_ENO_MESSAGE">ENO_MESSAGE</a>: u64 = 0;
</code></pre>



<a id="0xef_message_get_message"></a>

## Function `get_message`



<pre><code>#[view]
<b>public</b> <b>fun</b> <a href="hello.md#0xef_message_get_message">get_message</a>(addr: <b>address</b>): <a href="_String">string::String</a>
</code></pre>



<a id="0xef_message_set_message"></a>

## Function `set_message`



<pre><code><b>public</b> entry <b>fun</b> <a href="hello.md#0xef_message_set_message">set_message</a>(<a href="">account</a>: <a href="">signer</a>, <a href="hello.md#0xef_message">message</a>: <a href="_String">string::String</a>)
</code></pre>
