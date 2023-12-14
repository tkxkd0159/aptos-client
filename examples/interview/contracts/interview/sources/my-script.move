script {
    use std::signer;

    const MARKER: u64 = 7;

    fun main(src: &signer) {
        let src_addr = signer::address_of(src);

        ljs::transfer::do_nothing(src_addr, MARKER);
    }
}