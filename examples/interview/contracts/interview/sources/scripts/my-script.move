script {
    use std::signer;
    use ljs::transfer;

    const MARKER: u64 = 7;

    fun main(src: &signer) {
        let src_addr = signer::address_of(src);

        transfer::do_nothing(src_addr, MARKER);
    }
}