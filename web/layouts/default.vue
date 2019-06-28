<template>
<div>
    <Navbar/>
    <nuxt/>
    <hr class="border-primary">
    <Footer/>
    <div id="toast-container" aria-live="polite" aria-atomic="true" style="position: fixed; z-index: 99999; right: 20px; top: 80px"></div>
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
}
</script>
