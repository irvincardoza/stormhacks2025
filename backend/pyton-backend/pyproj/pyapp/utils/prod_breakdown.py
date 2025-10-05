import pandas as pd

def compute_productivity_stats(path: str):
    df = pd.read_json(path, lines=True)

    # Sanity check
    if "productive" not in df.columns or "idle_seconds" not in df.columns:
        raise ValueError("Missing required columns: 'productive' and 'idle_seconds'")

    # Convert to totals
    df["active_seconds"] = 60 - df["idle_seconds"].clip(lower=0, upper=60)

    productive_seconds = df.loc[df["productive"] == True, "active_seconds"].sum()
    unproductive_seconds = df.loc[df["productive"] == False, "active_seconds"].sum()
    idle_seconds_total = df["idle_seconds"].sum()

    total_seconds = len(df) * 60

    stats = {
        "productive": round(productive_seconds / total_seconds * 100, 2),
        "unproductive": round(unproductive_seconds / total_seconds * 100, 2),
        "idl%": round(idle_seconds_total / total_seconds * 100, 2),
        "total_minutes": len(df),
    }

    return stats


# Example usage
if __name__ == "__main__":
    stats = compute_productivity_stats("labeled_activity.jsonl")
    print("📊 Productivity Summary:")
    for k, v in stats.items():
        print(f"{k}: {v}")
