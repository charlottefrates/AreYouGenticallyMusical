<h1>How Genetically Musical Are you?</h1>
<p>Application that allows 23 and Me users to see a report on how musically talented they are based on their genetic makeup.</p>

## Getting started
### Installing
```
>   download music_talent files

```
### Launching
```
>   open index.html in browser
>   open live site at: https://charlottefrates.github.io/AreYouGenticallyMusical/
```
<h2>Developer Notes</h2>

<h3>Implementation and Document Flow</h3>

<ul>
  <li> Used 23andMe API (demo) to pull in user's relevant data (method associated with TwentyThreeAndMeClient)</li>
  <li> Implemented async callback using AJAX that captures API responses as promises.</li>
  <li> Once promises are resolved, the API reponse promises are saved as an object map for iteration</li>
  <li> grabbed user data name from response promises</li>
  <li> Ran methods to grab variant data based on genetic markers of interest </li>
    <ul>
        <li> compiled user variant maps based on API promise responses</li>
        <li> extracted string of alleles from each response to the variants of interest based on dosage</li>
        <li> compared each allele string to relative pre-determined weights checking for both the string response and the reveresed string response because allele order doesn't matter</li>
        <li> summed up allele weight data to get final scores</li>
        <li> mapped final score to musical scale</li>
        <li> outputted user name,score and string</li>
    </ul>
</ul>

<h3>Interesting Problems and Pitfalls</h3>

<ul>
  <li> CORS Error - implementation of node.js for "Access-Control-Allow-Origin" header responses</li>
  <li> Manegement of promises - how are promises handled in actual live codebase</li>
</ul>

<h3>Next Steps</h3>

<ul>
    <li> Error handing</li>
        <ul>
            <li> Permanent & Intermittent server-side failure </li>
                <ul>
                    <li> Handle server availbility situations </li>
                    <li> Handle 500 errors?</li>
                </ul>
            <li> Partial error responses </li>
                <ul>
                    <li> Hande 404 error (eg 3/4 variants present, 2/4 variants)</li>
                </ul>
            <li> Handle errors through UI </li>
        </ul>
    <li> Language/String Translation </li>
    <li> Unit Testing - ensuring that functions behave as expected in both success and failure cases</li>
    <li> Better UI </li>
</ul>