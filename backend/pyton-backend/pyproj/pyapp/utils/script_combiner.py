import pandas as pd
import json

def label_activity_with_productivity(
    screenshot_path: str,
    activity_path: str,
    output_path: str,
):
    # --- 1️⃣ Load JSONL files ---
    ss_df = pd.read_json(screenshot_path, lines=True)
    act_df = pd.read_json(activity_path, lines=True)

    # --- 2️⃣ Convert timestamps ---
    ss_df["timestamp"] = pd.to_datetime(ss_df["timestamp"])
    act_df["timestamp"] = pd.to_datetime(act_df["timestamp"])

    # --- 🔹 Round or floor timestamps to minute precision ---
    # This ensures 16:45:14 → 16:45:00
    ss_df["timestamp"] = ss_df["timestamp"].dt.floor("T")
    act_df["timestamp"] = act_df["timestamp"].dt.floor("T")

    # Sort by timestamp (important for propagation)
    ss_df.sort_values("timestamp", inplace=True)
    act_df.sort_values("timestamp", inplace=True)

    # --- 3️⃣ Merge using nearest timestamp (forward fill logic) ---
    merged = pd.merge_asof(
        act_df,
        ss_df[["timestamp", "productive"]],
        on="timestamp",
        direction="backward",
        tolerance=pd.Timedelta("10m"),
    )

    # --- 4️⃣ Fill initial unknowns ---
    merged["productive"] = merged["productive"].astype(object)
    merged["productive"].fillna("unknown", inplace=True)

    # --- 5️⃣ Propagate within same app/window sessions ---
    merged["session_change"] = (
        (merged["app_name"] != merged["app_name"].shift()) |
        (merged["window_title"] != merged["window_title"].shift())
    ).cumsum()

    merged["productive"] = merged.groupby("session_change")["productive"].ffill()

    # --- 6️⃣ Handle window/tab changes using later screenshot data ---
    def infer_future_label(row, ss_df):
        if row["productive"] != "unknown":
            return row["productive"]

        future_ss = ss_df[
            (ss_df["timestamp"] > row["timestamp"]) &
            (ss_df["app_name"] == row["app_name"]) &
            (ss_df["window_title"] == row["window_title"])
        ]

        if not future_ss.empty:
            return future_ss.iloc[0]["productive"]
        return "unknown"

    merged["productive"] = merged.apply(lambda r: infer_future_label(r, ss_df), axis=1)

    # --- 7️⃣ Save to JSONL output ---
    merged.drop(columns=["session_change"], inplace=True)
    merged.to_json(output_path, orient="records", lines=True, date_format="iso")

    print(f"✅ Labeled activity saved to {output_path}")


# Example usage
label_activity_with_productivity(
    screenshot_path=r"..\..\pyproj\gem_res_data\1_analysis.jsonl",
    activity_path=r"..\..\pyproj\gem_res_data\2_activity.jsonl",
    output_path="labeled_activity.jsonl",
)
