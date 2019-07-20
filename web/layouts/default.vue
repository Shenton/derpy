<template>
<div>
    <Navbar />
    <nuxt />
    <hr class="border-primary">
    <Footer />
    <div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true" />
    <b-button class="scroll-to-top" variant="primary" @click="scrollToTop()"><i class="fas fa-chevron-up" /></b-button>
</div>
</template>

<script>
import Navbar from '../components/navbar';
import Footer from '../components/footer';

export default {
    components: {
        Navbar,
        Footer,
    },
    methods: {
        scrollToTop() {
            $('html').animate({ scrollTop: 0 }, 'slow');
        },
    },
};
</script>

<style>
.toast-container {
    position: fixed;
    z-index: 99999;
    right: 10px;
    top: 70px
}

.scroll-to-top {
    display: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
}
</style>
