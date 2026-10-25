#!/usr/bin/env node

/**
 * Proof of Access Verification Script
 * Validates live access to official UNHCR Population API and HDX CKAN API.
 */

async function testUnhcrAccess() {
  console.log("\n=======================================================");
  console.log(" Testing Live Access: UNHCR Refugee Data Finder API");
  console.log(" URL: https://api.unhcr.org/population/v1/population/?year=2023&coa=ETH");
  console.log("=======================================================");

  const startTime = Date.now();
  try {
    const res = await fetch("https://api.unhcr.org/population/v1/population/?year=2023&coa=ETH&limit=1", {
      headers: {
        Accept: "application/json",
        "User-Agent": "EthiopiaMigrationObservatory/1.0 (Proof-of-Access)",
      },
    });

    const duration = Date.now() - startTime;
    console.log(`HTTP Status: ${res.status} ${res.statusText} (${duration}ms)`);

    if (!res.ok) {
      throw new Error(`Endpoint returned HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log("Payload Structure Verified:");
    console.log(`- Page: ${data.page}`);
    console.log(`- Items Retrieved: ${data.items?.length || 0}`);

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      console.log(`- Country of Asylum: ${item.coa_name} (${item.coa_iso})`);
      console.log(`- Registered Refugees: ${Number(item.refugees).toLocaleString()}`);
      console.log(`- Asylum Seekers: ${Number(item.asylum_seekers).toLocaleString()}`);
      console.log(`- Returned Refugees: ${Number(item.returned_refugees).toLocaleString()}`);
      console.log(`- IDP Caseload (Triangulated): ${Number(item.idps).toLocaleString()}`);
      console.log("✅ UNHCR API Proof of Access: SUCCESS");
    }
    return true;
  } catch (err) {
    console.error("❌ UNHCR API Proof of Access Failed:", err.message);
    return false;
  }
}

async function testHdxAccess() {
  console.log("\n=======================================================");
  console.log(" Testing Live Access: HDX CKAN Action API v3");
  console.log(" URL: https://data.humdata.org/api/3/action/package_search?q=ethiopia+iom+dtm&rows=1");
  console.log("=======================================================");

  const startTime = Date.now();
  try {
    const res = await fetch("https://data.humdata.org/api/3/action/package_search?q=ethiopia+iom+dtm&rows=1", {
      headers: {
        Accept: "application/json",
        "User-Agent": "EthiopiaMigrationObservatory/1.0 (Proof-of-Access)",
      },
    });

    const duration = Date.now() - startTime;
    console.log(`HTTP Status: ${res.status} ${res.statusText} (${duration}ms)`);

    if (!res.ok) {
      throw new Error(`Endpoint returned HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`- HDX Success Flag: ${data.success}`);
    console.log(`- Total Packages Matching Query: ${data.result?.count || 0}`);

    if (data.result?.results?.length > 0) {
      const pkg = data.result.results[0];
      console.log(`- Primary Dataset: "${pkg.title}"`);
      console.log(`- Package Name: ${pkg.name}`);
      console.log(`- Resources Count: ${pkg.resources?.length || 0}`);
      if (pkg.resources && pkg.resources.length > 0) {
        console.log(`- First Resource: ${pkg.resources[0].name} (${pkg.resources[0].format})`);
        console.log(`- Download URL: ${pkg.resources[0].url}`);
      }
      console.log("✅ HDX CKAN API Proof of Access: SUCCESS");
    }
    return true;
  } catch (err) {
    console.error("❌ HDX API Proof of Access Failed:", err.message);
    return false;
  }
}

async function main() {
  const unhcrSuccess = await testUnhcrAccess();
  const hdxSuccess = await testHdxAccess();

  console.log("\n=======================================================");
  console.log(" PROOF OF ACCESS SUMMARY");
  console.log(` UNHCR Live Access: ${unhcrSuccess ? "VERIFIED" : "FAILED"}`);
  console.log(` HDX Live Access:   ${hdxSuccess ? "VERIFIED" : "FAILED"}`);
  console.log("=======================================================\n");

  if (!unhcrSuccess || !hdxSuccess) {
    process.exit(1);
  }
}

main();
