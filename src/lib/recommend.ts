export type Goal = "compare" | "relationship" | "predict";
export type Groups = "two" | "three";
export type Dist = "normal" | "nonnormal";

export interface Recommendation {
  test: string;
  why: string;
  apa: string;
  alternative: string;
}

/**
 * Simplified slice of the full in-app decision tree.
 * Assumes an independent-groups design with a continuous DV for the
 * comparison branch; the full app also handles repeated measures,
 * factorial designs, categorical DVs, and more.
 */
export function recommend(goal: Goal, groups: Groups | null, dist: Dist): Recommendation {
  if (goal === "compare") {
    if (groups === "two") {
      return dist === "normal"
        ? {
            test: "Independent-samples t-test",
            why: "Two independent groups, a continuous dependent variable, and approximately normal distributions in each group point to the t-test.",
            apa: "t(58) = 2.31, p = .024, d = 0.60",
            alternative: "Mann–Whitney U (if normality or outliers are a concern)",
          }
        : {
            test: "Mann–Whitney U test",
            why: "With two independent groups and a non-normal (or ordinal) dependent variable, the rank-based Mann–Whitney U is the defensible choice.",
            apa: "U = 312.50, z = −2.18, p = .029",
            alternative: "Independent-samples t-test (if n is large and deviations are mild)",
          };
    }
    return dist === "normal"
      ? {
          test: "One-way ANOVA",
          why: "Three or more independent groups with a continuous, approximately normal dependent variable call for a one-way ANOVA, followed by post-hoc tests.",
          apa: "F(2, 87) = 4.52, p = .014, η² = .09",
          alternative: "Kruskal–Wallis H (if assumptions fail)",
        }
      : {
          test: "Kruskal–Wallis H test",
          why: "For three or more independent groups with non-normal or ordinal data, Kruskal–Wallis compares the groups without the normality assumption.",
          apa: "H(2) = 7.36, p = .025",
          alternative: "One-way ANOVA (robust with large, balanced groups)",
        };
  }

  if (goal === "relationship") {
    return dist === "normal"
      ? {
          test: "Pearson correlation",
          why: "Two continuous variables, an approximately linear relationship, and bivariate normality make Pearson's r the standard choice.",
          apa: "r(58) = .42, p < .001",
          alternative: "Spearman's ρ (for ordinal data or curvilinear monotonic trends)",
        }
      : {
          test: "Spearman's rank-order correlation",
          why: "When at least one variable is ordinal, or the data are non-normal or contain outliers, Spearman's ρ assesses the monotonic relationship safely.",
          apa: "ρ(58) = .38, p = .003",
          alternative: "Kendall's τ (better for small samples with many ties)",
        };
  }

  return {
    test: "Simple linear regression",
    why: "Predicting a continuous outcome from a predictor variable is a regression question — it gives you the equation, not just the association.",
    apa: "β = 0.41, t(58) = 3.40, p = .001, R² = .17",
    alternative: "Multiple regression (when you have more than one predictor)",
  };
}
