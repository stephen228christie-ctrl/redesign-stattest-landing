/**
 * StatTest decision engine — ported from the original app.html
 * (stattest-landing repo). Branching rules, assumption lists, and APA
 * templates are preserved exactly; the "why" explanations have been
 * expanded into plain English for students.
 */

export interface TestInfo {
  n: string; e: string; b: string; fit: number; altKey?: string;
  tl: string; why: string; ass: string[];
  alt?: { n: string; w: string };
  eff: string; ex: string; viz: string; ph?: string;
  spss: string; jmv: string; gp?: string;
  cnt?: string; sup?: string; sw?: string; wr?: string[];
}

export interface QOption { id: string; label: string; desc: string; emoji: string }
export interface Question { title: string; sub: string; icon: string; key: string; opts: QOption[] }

export type Answers = Record<string, string>;

export const T: Record<string, TestInfo> = {
  welch_ttest:{n:"Welch's Independent t-Test",e:"👥",b:"Parametric",fit:5,altKey:"mann_whitney",
    tl:"Compare two independent groups — robust to unequal variances",
    why:"You have two separate groups of people and want to know whether their average scores genuinely differ — or whether the gap you see could just be chance. Welch's t-test compares the two means while allowing the groups to have different spreads (variances) and even different sizes, which is why it has replaced the classic Student's t-test as the modern default (Field, 2018). If your scores are roughly bell-shaped within each group, this is the strongest, most defensible choice.",
    ass:["Continuous DV","Approximately normal per group (or n>30 by CLT)","Independent observations","No assumption of equal variances required"],
    alt:{n:"Mann-Whitney U Test",w:"when normality is violated"},
    eff:"Cohen's d — small≥0.20, medium≥0.50, large≥0.80",
    ex:"Comparing mean anxiety (GAD-7) between a CBT group and a waitlist control.",
    viz:"Side-by-side box plots; bar chart with mean ± 95% CI",
    spss:"Analyze → Compare Means → Independent-Samples T Test → use 'Equal variances not assumed' row",
    jmv:"T-Tests → Independent Samples T-Test (Welch's is the default in jamovi)",
    gp:"t-tests → Means: Two independent groups",
    cnt:"Cannot tell you which variable caused the difference.",
    sup:"Supervisors may ask: 'Why Welch's not Student's t?' Answer: Welch's is the modern recommended default.",
    wr:["A Welch's independent-samples t-test indicated that [DV] [significantly/did not significantly] differ between [Group 1] (M=___, SD=___) and [Group 2] (M=___, SD=___), t(df)=___, p=.___, d=___.","[Group 1] scored [significantly] [higher/lower] than [Group 2] on [DV]."]},
  paired_ttest:{n:"Paired Samples t-Test",e:"🔄",b:"Parametric",fit:5,altKey:"wilcoxon",
    tl:"Track changes in the same participants over time",
    why:"Because the same people were measured twice, every participant acts as their own control. The test works on each person's change score (Time 2 minus Time 1) and asks whether the average change is bigger than chance alone would produce. Comparing people to themselves strips out stable individual differences — some people just score high, others low — which gives you noticeably more statistical power than comparing two separate groups.",
    ass:["Continuous DV","Same participants at both time points","Difference scores approximately normal","No significant outliers in differences"],
    alt:{n:"Wilcoxon Signed-Rank Test",w:"when differences are non-normal"},
    eff:"Cohen's d from difference scores",
    ex:"PHQ-9 depression scores before vs. after a 12-week mindfulness programme.",
    viz:"Paired line plot; histogram of difference scores",
    spss:"Analyze → Compare Means → Paired-Samples T Test",
    jmv:"T-Tests → Paired Samples T-Test",
    gp:"t-tests → Means: Difference between two dependent means (matched pairs)",
    cnt:"Cannot establish causation — only that scores changed between time points.",
    sup:"Report t, df, p, and Cohen's d.",
    wr:["A paired-samples t-test revealed that [DV] [significantly/did not significantly] [increase/decrease] from [Time 1] (M=___, SD=___) to [Time 2] (M=___, SD=___), t(df)=___, p=.___, d=___.","[DV] [significantly changed / did not significantly change] from [Time 1] to [Time 2]."]},
  oneway_anova:{n:"One-Way ANOVA",e:"📊",b:"Parametric",fit:4,altKey:"kruskal_wallis",
    tl:"Compare three or more independent groups",
    why:"With three or more groups, running several t-tests would quietly inflate your chance of a false positive — every extra comparison is another roll of the dice. One-way ANOVA solves this by asking a single overall question first: is there at least one real difference somewhere among the group means? Only if the answer is yes do you follow up with post-hoc tests to pinpoint exactly which groups differ, keeping the overall error rate under control.",
    ass:["Continuous DV","Normality within each group","Homogeneity of variance (Levene's test)","Independent observations"],
    alt:{n:"Kruskal-Wallis Test",w:"when normality or equal variances are violated"},
    eff:"Eta-squared η² — small≥0.01, medium≥0.06, large≥0.14",
    ex:"Comparing wellbeing across lecture, flipped, and problem-based learning groups.",
    viz:"Box plots per group; means plot with 95% CI",
    ph:"Tukey HSD or Bonferroni",
    spss:"Analyze → Compare Means → One-Way ANOVA → Post Hoc",
    jmv:"ANOVA → One-Way ANOVA",
    gp:"F-tests → ANOVA: Fixed effects, omnibus, one-way",
    cnt:"Post-hoc tests are required to identify which specific groups differ.",
    sup:"Always report the omnibus F, η², and post-hoc results.",
    wr:["A one-way ANOVA indicated a [significant/non-significant] effect of [IV] on [DV], F(df₁,df₂)=___, p=.___, η²=___. Post-hoc comparisons (Tukey HSD) [showed/showed no significant differences].","There was a [significant/non-significant] difference in [DV] across the groups."]},
  rm_anova:{n:"Repeated Measures ANOVA",e:"🔁",b:"Parametric",fit:4,altKey:"friedman",
    tl:"Track the same participants across 3+ time points",
    why:"The same participants were measured at three or more time points (or under three or more conditions), so their scores are related — and that's actually an advantage. Repeated measures ANOVA uses each person as their own baseline, separating genuine change across conditions from stable differences between people. That makes it far more sensitive than testing separate groups at each time point would be.",
    ass:["Continuous DV","Sphericity — check Mauchly's test","Approximately normal residuals"],
    alt:{n:"Friedman Test",w:"when sphericity or normality is violated"},
    eff:"Partial η²p",
    ex:"Wellbeing at baseline, 3, 6, and 12 months post-intervention.",
    viz:"Line chart of means over time with SE bars",
    spss:"Analyze → General Linear Model → Repeated Measures",
    jmv:"ANOVA → Repeated Measures ANOVA",
    gp:"F-tests → ANOVA: Repeated measures, within factors",
    cnt:"Cannot establish causation from time alone.",
    sup:"Report Mauchly's test result and the correction applied.",
    wr:["A one-way repeated measures ANOVA indicated a [significant/non-significant] effect of [time/condition] on [DV], F(df₁,df₂)=___, p=.___, η²p=___.","[DV] [significantly changed / did not significantly change] across the time points."]},
  mann_whitney:{n:"Mann-Whitney U Test",e:"🏅",b:"Non-Parametric",fit:4,altKey:"welch_ttest",
    tl:"Compare two groups without assuming normality",
    why:"Your data don't meet the bell-curve assumption, so comparing means could mislead you. Mann-Whitney takes every score from both groups, puts them in one big ordered list, and checks whether one group's scores consistently sit higher in the ranking than the other's. Because it works on ranks rather than raw numbers, skewed data and extreme outliers can't distort the result — it's the safe, defensible choice here.",
    ass:["Ordinal or continuous DV","Independent observations","Similar distribution shapes"],
    alt:{n:"Welch's Independent t-Test",w:"when normality and approximately equal variances are met"},
    eff:"Rank-biserial r — small≥0.10, medium≥0.30, large≥0.50",
    ex:"Comparing Likert-scale job satisfaction (1–7) between two departments.",
    viz:"Box plots with median highlighted; violin plots",
    spss:"Analyze → Nonparametric Tests → Legacy Dialogs → 2 Independent Samples",
    jmv:"T-Tests → Independent Samples T-Test → check Mann-Whitney U",
    gp:"t-tests → Means: Two independent groups (add ~15% to N)",
    cnt:"Report medians, not means.",
    wr:["A Mann-Whitney U test indicated that [DV] [significantly/did not significantly] differ between [Group 1] (Mdn=___) and [Group 2] (Mdn=___), U=___, z=___, p=.___, r=___.","There was [a significant/no significant] difference between groups on [DV]."]},
  wilcoxon:{n:"Wilcoxon Signed-Rank Test",e:"✍️",b:"Non-Parametric",fit:4,altKey:"paired_ttest",
    tl:"Paired comparison without normality assumption",
    why:"This is the rank-based cousin of the paired t-test, for when your difference scores aren't normally distributed. It ranks each participant's change from Time 1 to Time 2 by size and asks whether changes in one direction (say, improvements) consistently outweigh changes in the other. Because only the ranks matter, a couple of extreme changes can't dominate the result the way they would in a t-test.",
    ass:["Paired observations","Ordinal or continuous DV","Differences can be meaningfully ranked"],
    alt:{n:"Paired Samples t-Test",w:"when differences are normally distributed"},
    eff:"Matched-pairs rank-biserial r",
    ex:"Anxiety ratings (1–10) before and after a relaxation training workshop.",
    viz:"Pre/post median bar chart; dot plot of individual changes",
    spss:"Analyze → Nonparametric Tests → Legacy Dialogs → 2 Related Samples",
    jmv:"T-Tests → Paired Samples T-Test → check Wilcoxon signed rank",
    gp:"t-tests → Means: Difference between two dependent means (add ~15%)",
    cnt:"Reports whether the typical change is zero — not the magnitude in original units.",
    wr:["A Wilcoxon signed-rank test indicated that [DV] [significantly/did not significantly] [change] from [Time 1] (Mdn=___) to [Time 2] (Mdn=___), z=___, p=.___, r=___.","[DV] [significantly changed / did not significantly change] from [Time 1] to [Time 2]."]},
  kruskal_wallis:{n:"Kruskal-Wallis Test",e:"📈",b:"Non-Parametric",fit:4,altKey:"oneway_anova",
    tl:"Compare 3+ independent groups without normality",
    why:"Think of this as the non-parametric version of one-way ANOVA. All scores from every group are ranked together in one list, and the test asks whether some groups consistently hold higher ranks than others — more than chance shuffling would produce. It's the safe choice when scores are skewed, ordinal, or contain outliers: no bell curve required, and your conclusion stays defensible.",
    ass:["Ordinal or continuous DV","Independent observations","Similar distribution shapes"],
    alt:{n:"One-Way ANOVA",w:"when normality and equal variances are met"},
    eff:"ε² or η² from the H statistic",
    ex:"Self-reported stress across five different occupational groups.",
    viz:"Box plots per group; violin plots",
    ph:"Dunn's test with Bonferroni correction",
    spss:"Analyze → Nonparametric Tests → Legacy Dialogs → K Independent Samples",
    jmv:"ANOVA → One-Way ANOVA → check Kruskal-Wallis",
    gp:"F-tests → ANOVA: Fixed effects, omnibus, one-way (add ~15% to N)",
    cnt:"Post-hoc tests are required to identify which specific groups differ.",
    wr:["A Kruskal-Wallis test revealed a [significant/non-significant] difference in [DV] across groups, H(df)=___, p=.___, ε²=___.","There was [a significant/no significant] difference in [DV] across the groups."]},
  friedman:{n:"Friedman Test",e:"🌀",b:"Non-Parametric",fit:3,altKey:"rm_anova",
    tl:"Repeated measures without parametric assumptions",
    why:"When the same participants are measured across three or more conditions but the data don't meet parametric assumptions, the Friedman test steps in. It ranks each participant's own scores across the conditions (their personal 1st, 2nd, 3rd…) and then checks whether one condition consistently outranks the others across people. No normality, no sphericity — just a clean within-person comparison.",
    ass:["Same participants across all conditions","Ordinal or continuous DV","3+ conditions"],
    alt:{n:"Repeated Measures ANOVA",w:"when sphericity and normality are met"},
    eff:"Kendall's W (0=no agreement, 1=perfect)",
    ex:"Therapists rating CBT, DBT, and ACT effectiveness for shared clients.",
    viz:"Median rank line chart",
    ph:"Wilcoxon tests with Bonferroni correction",
    spss:"Analyze → Nonparametric Tests → Legacy Dialogs → K Related Samples",
    jmv:"ANOVA → Repeated Measures ANOVA → check Friedman",
    gp:"F-tests → ANOVA: Repeated measures (add ~15% to N)",
    cnt:"Shows whether conditions differ in rank order — not the size of change in original units.",
    wr:["A Friedman test indicated a [significant/non-significant] difference in [DV] across conditions, χ²(df)=___, p=.___, W=___.","[DV] [significantly differed / did not significantly differ] across the conditions."]},
  pearson:{n:"Pearson Correlation (r)",e:"📉",b:"Parametric",fit:5,altKey:"spearman",
    tl:"Measure linear relationship between two continuous variables",
    why:"Pearson's r puts a single number on how tightly two continuous variables move together in a straight line: from −1 (perfect negative relationship) through 0 (no linear relationship) to +1 (perfect positive). Your variables are both continuous and roughly normal, which is exactly when r is at its best. One caution: always look at the scatter plot too — r can completely miss a curved relationship.",
    ass:["Both variables continuous","Both approximately normally distributed","Linear relationship — verify with scatter plot","No significant outliers"],
    alt:{n:"Spearman's Rank Correlation (ρ)",w:"when either variable is non-normal or ordinal"},
    eff:"r itself — small≥0.10, medium≥0.30, large≥0.50",
    ex:"Correlating weekly exercise hours with WEMWBS wellbeing scores.",
    viz:"Scatter plot with regression line and 95% confidence band",
    spss:"Analyze → Correlate → Bivariate → select Pearson",
    jmv:"Regression → Correlation Matrix → select Pearson's r",
    gp:"Exact → Correlation: Bivariate normal model",
    cnt:"Cannot establish causation. Cannot describe non-linear relationships.",
    sup:"Check both variables for normality and inspect the scatter plot.",
    wr:["A Pearson correlation indicated a [significant/non-significant] [positive/negative] relationship between [Var 1] and [Var 2], r(N−2)=.___, p=.___.","There was [a significant/no significant] linear relationship between [Var 1] and [Var 2]."]},
  spearman:{n:"Spearman's Rank Correlation (ρ)",e:"🔗",b:"Non-Parametric",fit:4,altKey:"pearson",
    tl:"Robust correlation for non-normal or ordinal data",
    why:"Spearman's ρ measures whether two variables rise and fall together — without assuming the relationship is a straight line or that the data are bell-shaped. It converts each variable to ranks first, so a few extreme values can't drag the result around the way they can with Pearson's r. That makes it ideal for ordinal scales, skewed scores, and small samples with outliers.",
    ass:["Ordinal or continuous variables","Monotonic relationship — check scatter plot","No normality required"],
    alt:{n:"Pearson Correlation (r)",w:"when both variables are normally distributed and linearly related"},
    eff:"ρ itself — same benchmarks as Pearson r",
    ex:"Correlating Likert attachment anxiety scores with relationship satisfaction.",
    viz:"Scatter plot with Loess smoother",
    spss:"Analyze → Correlate → Bivariate → select Spearman",
    jmv:"Regression → Correlation Matrix → select Spearman's rho",
    gp:"Exact → Correlation: Bivariate normal model (add ~15% to N)",
    cnt:"Captures monotonic relationships only.",
    wr:["A Spearman's rank-order correlation indicated a [significant/non-significant] [positive/negative] relationship between [Var 1] and [Var 2], ρ(N−2)=.___, p=.___.","There was [a significant/no significant] monotonic relationship between [Var 1] and [Var 2]."]},
  kendalls_tau:{n:"Kendall's Tau-b (τ-b)",e:"🎯",b:"Non-Parametric",fit:4,altKey:"spearman",
    tl:"Correlation for ordinal data with many tied ranks",
    why:"Like Spearman's, Kendall's tau works on ranks rather than raw scores — but it handles tied ranks much more gracefully. Ties happen whenever many participants give the same answer, which is very common with ordinal measures like education level or single Likert items. With lots of ties or a small sample, tau-b gives a more accurate, more conservative picture of the association than Spearman's ρ would.",
    ass:["Both variables ordinal or ranked","Monotonic relationship","Handles tied ranks well"],
    alt:{n:"Spearman's Rank Correlation (ρ)",w:"when few ties exist and n is large"},
    eff:"τ-b itself — small≥0.10, medium≥0.30, large≥0.50",
    ex:"Correlating education level (1=GCSE…5=PhD) with symptom severity rating.",
    viz:"Scatter plot of ranks",
    spss:"Analyze → Correlate → Bivariate → select Kendall's tau-b",
    jmv:"Regression → Correlation Matrix → select Kendall's tau-b",
    gp:"Exact → Correlation: Bivariate normal model (add ~15%)",
    cnt:"τ-b and Spearman's ρ cannot be compared directly.",
    wr:["A Kendall's tau-b correlation indicated a [significant/non-significant] relationship between [Var 1] and [Var 2], τ-b=.___, z=___, p=.___.","There was [a significant/no significant] association between [Var 1] and [Var 2]."]},
  simple_regression:{n:"Simple Linear Regression",e:"📐",b:"Parametric",fit:4,
    tl:"Predict a continuous outcome from one predictor",
    why:"Correlation tells you two variables are related; regression goes one step further and gives you a prediction equation — a line of best fit through your data. It tells you how much the outcome is expected to change for every one-unit increase in your predictor, and R² tells you what percentage of the outcome's variation your predictor actually explains. That's a much more useful sentence for your results chapter than 'they're correlated'.",
    ass:["Linear relationship","Normal residuals — check Q-Q plot after running model","Homoscedasticity","Independent observations"],
    alt:{n:"Spearman or non-linear regression",w:"when linearity or residual normality is violated"},
    eff:"R²; Cohen's f² — small≥0.02, medium≥0.15, large≥0.35",
    ex:"Predicting exam performance (%) from total study hours.",
    viz:"Scatter with regression line; residual-vs-fitted plot",
    spss:"Analyze → Regression → Linear (1 IV in 'Independents')",
    jmv:"Regression → Linear Regression",
    gp:"F-tests → Linear Multiple Regression: Fixed model, R² increase",
    cnt:"Cannot prove causation. Normality applies to residuals, not the raw DV.",
    wr:["[Predictor] [significantly/did not significantly] predict [DV], β=.___, t(df)=___, p=.___, R²=.___.","[Predictor] [significantly/did not significantly] predict [DV], accounting for ___% of its variance."]},
  multiple_regression:{n:"Multiple Linear Regression",e:"🔮",b:"Parametric",fit:4,
    tl:"Predict a continuous outcome from multiple predictors",
    why:"Real outcomes rarely have a single cause, and multiple regression embraces that: it weighs all your predictors at once and reports each one's unique contribution — what it adds over and above everything else in the model. That word 'unique' is the key insight: a predictor can correlate strongly with the outcome on its own, yet add almost nothing once the other predictors are accounted for.",
    ass:["Linear relationships","Normal residuals","Homoscedasticity","No multicollinearity (VIF<10)","Independent observations"],
    alt:{n:"Ridge or Lasso regression",w:"when multicollinearity is severe"},
    eff:"R² (overall); standardised β per predictor; ΔR² per block",
    ex:"Predicting wellbeing from age, social support, and perceived stress.",
    viz:"Coefficient plot; residuals vs. fitted",
    spss:"Analyze → Regression → Linear (all IVs in 'Independents')",
    jmv:"Regression → Linear Regression",
    gp:"F-tests → Linear Multiple Regression: Fixed model, R² increase",
    cnt:"Use adjusted R² for honest comparison. Cannot prove causation.",
    wr:["Multiple regression indicated the model [significantly/did not significantly] predict [DV], F(df₁,df₂)=___, p=.___, R²=___. [Predictor 1] (β=.___, p=___) [was/was not] a significant predictor.","The predictors [accounted / did not account] for a significant proportion of variance in [DV]."]},
  logistic_regression:{n:"Binary Logistic Regression",e:"⚖️",b:"Parametric",fit:4,
    tl:"Predict the probability of a binary outcome",
    why:"Your outcome has exactly two possibilities (pass/fail, yes/no, dropout/stay), so an ordinary straight-line model won't work — predictions must stay between 0% and 100%. Logistic regression models the probability of the outcome instead, and expresses each predictor's influence as an odds ratio: how many times the odds of the outcome multiply for each one-unit increase in that predictor. It happily mixes continuous and categorical predictors in the same model.",
    ass:["Binary DV","Log-odds linearity with continuous predictors","No multicollinearity","≥20 events per predictor","Independent observations"],
    alt:{n:"Probit regression",w:"for alternative probability modelling"},
    eff:"Nagelkerke R²; Odds Ratios (OR); AUC-ROC",
    ex:"Predicting pass/fail from attendance rate, study hours, and prior GPA.",
    viz:"ROC curve; forest plot of odds ratios",
    spss:"Analyze → Regression → Binary Logistic",
    jmv:"Regression → Logistic Regression → Binomial",
    gp:"z-tests → Logistic regression",
    cnt:"Odds Ratios ≠ probabilities.",
    wr:["Binary logistic regression indicated a [significant/non-significant] model, χ²(df)=___, p=.___, Nagelkerke R²=___. [Predictor] [significantly/did not significantly] predict [DV] (OR=___, 95% CI [___,___], p=___).", "[Predictor] [significantly/did not significantly] predict the likelihood of [DV]."]},
  chi_square:{n:"Chi-Square Test (χ²)",e:"🔲",b:"Non-Parametric",fit:4,altKey:"fisher_exact",
    tl:"Test association between two categorical variables",
    why:"Both of your variables are categories, so there are no means to compare — only counts of people in each combination. Chi-square compares the counts you actually observed against the counts you would expect if the two variables had nothing to do with each other. A big enough gap between observed and expected tells you the variables are associated — for example, that therapy preference really does differ by gender.",
    ass:["Both variables categorical","Independent observations","Expected cell frequencies ≥5 in ALL cells"],
    alt:{n:"Fisher's Exact Test",w:"when any expected cell frequency is < 5"},
    eff:"Cramér's V — small≥0.10, medium≥0.30, large≥0.50",
    ex:"Gender × preference for face-to-face vs. online therapy.",
    viz:"Stacked bar chart; mosaic plot",
    spss:"Analyze → Descriptive Statistics → Crosstabs → Statistics → Chi-square",
    jmv:"Frequencies → Contingency Tables",
    gp:"χ²-tests → Goodness-of-fit tests: Contingency tables",
    cnt:"Shows that an association exists — not its direction.",
    sup:"Always verify expected cell frequencies. Report χ², df, p, N, and Cramér's V.",
    wr:["A chi-square test of independence indicated a [significant/non-significant] association between [Var 1] and [Var 2], χ²(df)=___, p=.___, N=___, V=___.","There was [a significant/no significant] association between [Var 1] and [Var 2]."]},
  fisher_exact:{n:"Fisher's Exact Test",e:"🔬",b:"Non-Parametric",fit:4,altKey:"chi_square",
    tl:"Test association when expected cell counts are small",
    why:"Chi-square relies on an approximation that breaks down when any expected cell count drops below 5 — which happens all the time in small samples and pilot studies. Fisher's exact test sidesteps the approximation entirely: it calculates the exact probability of getting a table like yours by chance. That means the p-value stays trustworthy no matter how small your sample is.",
    ass:["Both variables categorical (typically 2×2)","At least one expected cell frequency <5","Independent observations"],
    alt:{n:"Chi-Square Test (χ²)",w:"when all expected cell frequencies are ≥5"},
    eff:"Odds Ratio (OR); phi coefficient φ",
    ex:"Treatment type (CBT vs. waitlist) predicting dropout in a small pilot study (n=24).",
    viz:"2×2 contingency table with exact p-value",
    spss:"Analyze → Descriptive Statistics → Crosstabs (Fisher's appears automatically for 2×2)",
    jmv:"Frequencies → Contingency Tables → Statistics → Fisher's exact test",
    gp:"χ²-tests → Contingency tables (use chi-square as approximation)",
    cnt:"Standard Fisher's is designed for 2×2 tables.",
    wr:["Fisher's exact test indicated a [significant/non-significant] association between [Var 1] and [Var 2], p=.___ (exact), OR=___, 95% CI [___,___].","There was [a significant/no significant] association between [Var 1] and [Var 2]."]},
  mediation_moderation:{n:"Mediation / Moderation Analysis",e:"🔀",b:"Advanced",fit:3,
    tl:"Unpack how and when relationships occur",
    why:"These analyses unpack a relationship rather than just confirm one exists. Mediation asks how: does X influence Y through some in-between mechanism M (X→M→Y)? Moderation asks when: does the strength of the X→Y link change depending on a third variable? One crucial caveat — your causal ordering must come from theory, not from the data. The analysis cannot tell you which direction the arrows point; your literature review has to.",
    ass:["Causal ordering grounded in theory","Bootstrapping recommended (n≥200)","Measurement reliability across all variables"],
    alt:{n:"Structural Equation Modelling (SEM)",w:"for complex mediation chains or latent variables"},
    eff:"Mediation: indirect effect (a×b path); Moderation: interaction β₃",
    ex:"Self-efficacy mediating social support → academic performance (Hayes, 2022).",
    viz:"Path diagram; interaction plot",
    sw:"PROCESS Macro v4 (Hayes, 2022) — most widely used tool in psychology.",
    spss:"PROCESS v4 → Model 4 (mediation) or Model 1 (moderation)",
    jmv:"Install jAMM or PROCESS module from jamovi library",
    gp:"F-tests → Linear Multiple Regression (for direct paths only)",
    cnt:"Mediation in correlational data cannot prove causation.",
    sup:"Examiners will ask: what is your theoretical justification for the causal ordering?",
    wr:["A mediation analysis using bootstrapping (5,000 samples; Hayes, 2022) indicated a [significant/non-significant] indirect effect of [X] on [Y] through [M], b=.___, 95% CI [___,___].","[M] [significantly / did not significantly] mediate the relationship between [X] and [Y]."]},
};

export const QS: Record<string, Question> = {
  objective:{title:"What is your primary research objective?",sub:"This shapes your entire statistical strategy",icon:"🎯",key:"objective",opts:[
    {id:"compare",label:"Compare groups or conditions",desc:'"Do men and women differ in stress levels?"',emoji:"⚖️"},
    {id:"relationship",label:"Explore a relationship between variables",desc:'"Is anxiety related to sleep quality?"',emoji:"🔗"},
    {id:"predict",label:"Predict an outcome variable",desc:'"What factors predict academic performance?"',emoji:"📈"},
    {id:"association",label:"Test association between two categorical variables",desc:'"Is gender linked to therapy preference?"',emoji:"🔲"},
  ]},
  assoc_type:{title:"What level of measurement are your two variables?",sub:"This determines the association test",icon:"📊",key:"assocType",opts:[
    {id:"nominal",label:"Both nominal — unordered categories",desc:"e.g. gender × treatment type",emoji:"🗂️"},
    {id:"ordinal",label:"One or both are ordinal — ordered or ranked",desc:"e.g. education level, agreement scale",emoji:"🏷️"},
  ]},
  cell_size:{title:"Do you expect any cells to have fewer than 5 observations?",sub:"Chi-square becomes unreliable with very small expected cell counts",icon:"⚠️",key:"cellSize",opts:[
    {id:"adequate",label:"No — all expected cells should have ≥5 observations",desc:"Chi-square is appropriate",emoji:"✅"},
    {id:"small",label:"Yes — some cells may have fewer than 5",desc:"Common with n<40 or very unequal groups",emoji:"⚠️"},
  ]},
  groups:{title:"How many groups are you comparing?",sub:"Count the distinct conditions in your study",icon:"👥",key:"groups",opts:[
    {id:"2",label:"Two groups",desc:"e.g. control vs. experimental, male vs. female",emoji:"2️⃣"},
    {id:"3plus",label:"Three or more groups",desc:"e.g. three treatment conditions",emoji:"3️⃣"},
  ]},
  design:{title:"What is your study design?",sub:"How do participants relate to the conditions?",icon:"🔬",key:"design",opts:[
    {id:"independent",label:"Independent samples",desc:"Different participants in each group — between-subjects",emoji:"👥"},
    {id:"paired",label:"Paired / matched (exactly 2 time points)",desc:"Same participants measured twice",emoji:"🔄"},
    {id:"repeated",label:"Repeated measures (3+ time points)",desc:"Same participants across 3+ conditions",emoji:"🔁"},
  ]},
  dv_type:{title:"What type is your dependent variable?",sub:"The outcome you are measuring",icon:"📊",key:"dvType",opts:[
    {id:"continuous",label:"Continuous",desc:"Any numeric value — scores, times, measurements",emoji:"📏"},
    {id:"ordinal",label:"Ordinal",desc:"Ordered categories — always treated as non-parametric",emoji:"🏷️"},
    {id:"likert",label:"Likert Scale (1–5 or 1–7)",desc:"Rating scale items",emoji:"⭐"},
    {id:"binary",label:"Binary",desc:"Exactly two outcomes — yes/no, pass/fail",emoji:"🔘"},
    {id:"categorical",label:"Categorical (3+ unordered groups)",desc:"Groups with no natural order",emoji:"🗂️"},
  ]},
  likert_type:{title:"Is this a single item or a composite scale?",sub:"This determines the statistical approach",icon:"💡",key:"likertType",opts:[
    {id:"single",label:"Single item",desc:"One rating question",emoji:"1️⃣"},
    {id:"multi",label:"Multi-item composite scale",desc:"Multiple items averaged — e.g. PHQ-9, GAD-7",emoji:"📋"},
  ]},
  rel_type:{title:"What kind of relationship are you examining?",sub:"Choose the analysis that best fits",icon:"🔗",key:"relType",opts:[
    {id:"two_continuous",label:"Two continuous variables",desc:'"How does sleep relate to cognitive performance?"',emoji:"📉"},
    {id:"two_ordinal",label:"Two ordinal or ranked variables",desc:'"Does education level relate to treatment preference?"',emoji:"🏷️"},
    {id:"mediation",label:"Mediation or moderation",desc:'"Does self-efficacy explain the stress–performance link?"',emoji:"🔀"},
  ]},
  pred_dv_type:{title:"What type is your outcome (dependent) variable?",sub:"The variable you want to predict",icon:"🎯",key:"predDvType",opts:[
    {id:"continuous",label:"Continuous",desc:"Numeric outcome — score, time",emoji:"📏"},
    {id:"binary",label:"Binary / Dichotomous",desc:"Two categories — pass/fail",emoji:"🔘"},
    {id:"categorical",label:"Categorical (3+ categories)",desc:"Multiple unordered groups",emoji:"🗂️"},
  ]},
  pred_iv_count:{title:"How many predictor variables?",sub:"Independent variables entering your model",icon:"🔢",key:"predIvCount",opts:[
    {id:"one",label:"One predictor",desc:"A single independent variable",emoji:"1️⃣"},
    {id:"multiple",label:"Two or more predictors",desc:"Multiple IVs examined simultaneously",emoji:"🔢"},
  ]},
  norm_n:{title:"How many participants per group?",sub:"Larger samples help via the Central Limit Theorem",icon:"👥",key:"normN",opts:[
    {id:"under30",label:"Fewer than 30",desc:"Small sample — normality matters more here",emoji:"🔍"},
    {id:"n30_100",label:"30 to 100",desc:"Medium sample — CLT helps, check for clear skew",emoji:"📊"},
    {id:"over100",label:"More than 100",desc:"Large sample — CLT applies strongly",emoji:"📦"},
  ]},
  norm_result:{title:"What does your data look like?",sub:"Check histogram or Q-Q plot in your software",icon:"📈",key:"normResult",opts:[
    {id:"normal",label:"Clearly normal",desc:"Bell-shaped, Q-Q plot follows diagonal",emoji:"🔔"},
    {id:"nonnormal",label:"Skewed or non-normal",desc:"Clear skew, outliers, or normality test failed",emoji:"↗️"},
    {id:"unsure",label:"Not sure",desc:"We'll recommend non-parametric (safer option)",emoji:"🤔"},
  ]},
};

export function effectiveNorm(a: Answers): string {
  if(a.dvType==="ordinal") return "nonnormal";
  if(a.dvType==="likert"&&a.likertType==="single") return "nonnormal";
  const n=a.normN,r=a.normResult;
  if(!n||!r||r==="unsure") return "unknown";
  if(n==="over100") return r==="nonnormal"?"nonnormal":"normal";
  if(n==="n30_100") return r==="normal"?"normal":"nonnormal";
  return r==="normal"?"normal":"nonnormal";
}

export function recommend(a: Answers): string {
  const ok=effectiveNorm(a)==="normal";
  if(a.objective==="association"){
    if(a.assocType==="ordinal") return "kendalls_tau";
    if(a.cellSize==="small") return "fisher_exact";
    return "chi_square";
  }
  if(a.objective==="relationship"){
    if(a.relType==="mediation") return "mediation_moderation";
    if(a.relType==="two_ordinal") return "kendalls_tau";
    return ok?"pearson":"spearman";
  }
  if(a.objective==="predict"){
    if(a.predDvType==="binary") return "logistic_regression";
    return a.predIvCount==="one"?"simple_regression":"multiple_regression";
  }
  if(a.objective==="compare"){
    if(a.dvType==="categorical"||a.dvType==="binary") return "chi_square";
    if(a.design==="repeated") return ok?"rm_anova":"friedman";
    if(a.groups==="2"){
      if(a.design==="paired") return ok?"paired_ttest":"wilcoxon";
      return ok?"welch_ttest":"mann_whitney";
    }
    return ok?"oneway_anova":"kruskal_wallis";
  }
  return "pearson";
}

export function nextQ(q: string, a: Answers): string {
  if(q==="objective"){
    if(a.objective==="compare") return "groups";
    if(a.objective==="relationship") return "rel_type";
    if(a.objective==="predict") return "pred_dv_type";
    return "assoc_type";
  }
  if(q==="assoc_type") return a.assocType==="ordinal"?"result":"cell_size";
  if(q==="cell_size") return "result";
  if(q==="groups") return "design";
  if(q==="design") return "dv_type";
  if(q==="dv_type"){
    if(a.dvType==="continuous") return "norm_n";
    if(a.dvType==="likert") return "likert_type";
    return "result";
  }
  if(q==="likert_type") return a.likertType==="single"?"result":"norm_n";
  if(q==="rel_type") return a.relType==="two_continuous"?"norm_n":"result";
  if(q==="pred_dv_type") return a.predDvType==="continuous"?"pred_iv_count":"result";
  if(q==="pred_iv_count") return "result";
  if(q==="norm_n") return "norm_result";
  if(q==="norm_result") return "result";
  return "result";
}
