# 📁 Result_Analysis

This folder contains all the materials and scripts used for analyzing interview responses and rating data, including notebooks, raw data, and summary results.

## 📄 File Overview

| File Name                    | Description |
|-----------------------------|-------------|
| `interview draft.zip`       | Compressed folder containing raw or draft versions of interview transcripts. |
| `Interview_result.ipynb`    | Jupyter notebook for processing and analyzing interview responses (e.g. keyword extraction, sentiment analysis, topic distribution). |
| `model compare.xlsx`        | Excel file summarizing model performance comparisons, used for evaluating AI-generated content. |
| `RateDataResult_analysis.ipynb` |  Jupyter notebook focused on analyzing evaluation data based on interviewees’ ratings across five key dimensions: **Difficulty Matching**, **Type Appropriateness**, **Relevance**, **Factual Correctness**, and **Ambiguity**. These dimensions are defined in the evaluation framework and assessed on a 5-point Likert scale. |
| `test-an.Rmd`               | R Markdown file that analyzes the raw rating data in `test1.csv`, including visualizations and statistical summaries across the five evaluation dimensions.|
| `test1.csv`                 | The original raw rating file, containing interviewees’ evaluation scores across five dimensions defined in the evaluation framework. Used as input for analysis in `RateDataResult_analysis.ipynb` and `test-an.Rmd`.|
| `Keywords_Word_Cloud.ipynb`      | This file analyzes user interview transcripts to extract and visualize the most frequent positive and negative feedback keywords using frequency tables and word clouds.|

## 📌 Notes

- Current dataset is small and exploratory. With more interview samples, these methods can reveal deeper patterns and user insights.
- Files are organized for modular analysis using both Python (Jupyter Notebooks) and R (RMarkdown).

## 📂 How to Use

1. Unzip `interview draft.zip` to access raw interview content.
2. Run `Interview_result.ipynb` to generate visual and textual summaries.
3. Explore model performance using `model compare.xlsx`.
4. Use `RateDataResult_analysis.ipynb` or `test-an.Rmd` to analyze evaluation data based on the five-dimension framework.
5. `test1.csv` is the shared data source used in both analysis scripts.
6. Run `Keywords_Word_Cloud.ipynb` to automatically extract, count, and visualize the most frequent positive and negative feedback keywords from multiple interview transcripts.

---


