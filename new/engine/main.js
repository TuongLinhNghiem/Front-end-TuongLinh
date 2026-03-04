import { VNEngine } from './vn_engine.js';

window.addEventListener('DOMContentLoaded', () => {

    console.log("Creating VN Engine instance...");

    const vnEngine = new VNEngine();

    // debug
    window.vnEngine = vnEngine;

});