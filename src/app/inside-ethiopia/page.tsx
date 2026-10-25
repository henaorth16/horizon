import React from "react";
import type { Metadata } from "next";
import { getRegionalIdpCaseloads, getDisplacementByDriver } from "@/lib/db";
import { getEthiopiaAdm1Topology } from "@/lib/geo/server";
import { InsideEthiopiaView } from "@/components/maps";

export const metadata: Metadata = {
  title: "Inside Ethiopia — Regional Displacement Tracking & Choropleth Map",
  description:
    "Subnational analysis of IDP caseloads, returnee village dynamics, and driver corridors across 12 Ethiopian administrative regional states with synchronized cross-filtering.",
};

export default function InsideEthiopiaPage() {
  const regionalCaseloads = getRegionalIdpCaseloads();
  const driverBreakdown = getDisplacementByDriver();
  const adm1Topology = getEthiopiaAdm1Topology();

  return (
    <InsideEthiopiaView
      regionalCaseloads={regionalCaseloads}
      driverBreakdown={driverBreakdown}
      adm1Topology={adm1Topology || undefined}
    />
  );
}
