require('dotenv').config();
const mongoose = require('mongoose');
const { runClusteringJob } = require('./jobs/clusteringJob');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log("Connected to DB. Running clustering job...");
    await runClusteringJob();
    console.log("Clustering job finished. Exiting...");
    process.exit(0);
});
