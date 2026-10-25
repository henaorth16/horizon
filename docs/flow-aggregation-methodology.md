# Flow & Sankey Aggregation Methodology

**Ethiopia Migration & Displacement Observatory**  
*Document Version:* 1.0.0  
*Standards Conformance:* IOM DTM Standards, UNHCR ProGres Guidelines, WCAG 2.1 AA Accessibility

---

## 1. Overview & Mathematical Model

The Observatory's Flow & Sankey Visualization engine models origin-destination pathways for internal displacement (IOM DTM), cross-border refugee arrivals (UNHCR), and international irregular outflows (IOM / MMC).

To guarantee responsive rendering across desktop, tablet, and mobile screens without monolithic third-party canvas overhead, the layout algorithm calculates nodes and connecting ribbons using **declarative SVG math** and **D3 cubic Bézier interpolation**.

### 1.1 Node Column Layout
Nodes are partitioned into distinct functional columns:
- **Left Column ($X_0$):** Source origins (e.g., origin countries, crisis epicenter zones, departure woredas).
- **Right Column ($X_1$):** Target destinations (e.g., camp settlements, collective centers, transit destination states).

The vertical allocation of space for each node is proportional to its aggregate incoming or outgoing caseload:

$$
H_i = \max\left(H_{\min}, \frac{V_i}{\sum_{j} V_j} \times H_{\text{available}}\right)
$$

where:
- $V_i$ is the total individual caseload passing through node $i$.
- $H_{\text{available}} = H_{\text{bounded}} - (N - 1) \times G_{\text{node}}$ represents total vertical height minus inter-node spacing gaps.
- $H_{\min} = 14\text{px}$ guarantees a minimum clickable and legible bounding box for low-volume nodes.

---

## 2. Ribbon Curvature & Volume Scaling

Flow connections between source nodes $(X_0, Y_{0})$ and target destinations $(X_1, Y_{1})$ are rendered as smooth, closed SVG paths using cubic Bézier spline interpolation:

```svg
M x0, y0_top
C x_mid, y0_top  x_mid, y1_top  x1, y1_top
L x1, y1_bottom
C x_mid, y1_bottom  x_mid, y0_bottom  x0, y0_bottom
Z
```

where:
- $X_{\text{mid}} = \frac{X_0 + X_1}{2}$ defines the horizontal inflection midpoint.
- The link thickness $W_L$ is scaled linearly to verified caseload:

$$
W_L = \text{scaleLinear}\Big(\text{domain}: [0, \max(V)], \text{range}: [2, 48]\Big)(V_L)
$$

This guarantees that high-volume pathways (e.g., South Sudan to Gambela: 378,000 individuals) are visually dominant over secondary pathways, while low-volume paths retain a minimum 2px visible stroke.

---

## 3. Honest Labeling of Diffuse & Unrecorded Flows

In emergency displacement and clandestine migration, humanitarian enumerators frequently encounter movements where:
1. Exact village or woreda of origin cannot be corroborated due to active hostilities or sudden nighttime flight.
2. Displaced individuals reside informally with host kin outside designated collective sites (*diffuse accommodations*).
3. Migrants travel via unmonitored desert or maritime corridors without formal border registration.

### 3.1 Methodological Rules
- **No Synthetic Imputation:** Diffuse or unrecorded flows are **never** artificially distributed across neighboring jurisdictions to achieve false mathematical perfection.
- **Explicit Transparent Nodes:** When data contains unverified origins or destinations, the engine generates designated nodes explicitly labeled:
  - `"Diffuse / Unrecorded Origins"`
  - `"Dispersed Host Communities"`
  - `"Clandestine / Unrecorded En-Route"`
- **Distinct Visual Semantics:** Diffuse nodes are rendered with muted slate palettes (`#64748b`), dashed link borders, and dedicated methodology badges explaining the field limitation.

---

## 4. Legal Mandate Isolation

In strict accordance with international humanitarian law and the Observatory's core data contracts:
1. **Refugee Inflows (UNHCR):** Governed under the **1951 Geneva Refugee Convention**. Originates in neighboring nations and terminates in Ethiopian camps or urban centers.
2. **Internal Displacement Flows (IOM DTM):** Governed under the **African Union Kampala Convention**. Originates and terminates within the sovereign territory of Ethiopia.
3. **Irregular Outflows (IOM Flow Monitoring / MMC):** Governed under mixed migration monitoring frameworks.

> [!IMPORTANT]
> IDP internal flows and cross-border refugee flows are partitioned into independent datasets and toggled via discrete dataset selectors. They are never summed into composite flow totals.

---

## 5. Synchronized Accessible Alternatives

To comply with **WCAG 2.1 AA** standards, every visual flow diagram is accompanied by a synchronized data table alternative providing:
- Full tabular representation of every origin-destination pair.
- Exact numeric counts and percentage of dataset volume.
- Associated crisis trigger or corridor category.
- Primary source citation and assessment reporting date.
- Keyboard-accessible table navigation and screen reader semantics (`aria-label`, `<caption>`, `<th scope="col">`, `<th scope="row">`).
