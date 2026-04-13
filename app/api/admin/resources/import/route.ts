import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import { createSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();

    const { rows } = (await req.json()) as { rows: Record<string, string>[] };
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    // Cache subjects and categories to avoid N+1 queries
    const subjects = await Subject.find({ isActive: true }).lean();
    const categories = await Category.find({ isActive: true }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subjectMap = new Map(subjects.map((s: any) => [s.slug, s]));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryMap = new Map(categories.map((c: any) => [c.slug, c]));

    const results: { row: number; success: boolean; slug?: string; error?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.title?.trim()) throw new Error("title is required");
        if (!row.fileUrl?.trim()) throw new Error("fileUrl is required");
        if (!row.fileKey?.trim()) throw new Error("fileKey is required");

        const subject = subjectMap.get(row.subject?.trim().toLowerCase());
        if (!subject) throw new Error(`Subject slug "${row.subject}" not found`);

        const category = categoryMap.get(row.category?.trim().toLowerCase());
        if (!category) throw new Error(`Category slug "${row.category}" not found`);

        const medium = row.medium?.trim().toLowerCase();
        if (!["sinhala", "tamil", "english"].includes(medium)) {
          throw new Error(`Invalid medium "${row.medium}" (must be sinhala, tamil or english)`);
        }

        const slugBase = row.slug?.trim() || createSlug(row.title.trim());
        let finalSlug = slugBase;
        let n = 2;
        while (await Resource.exists({ slug: finalSlug })) finalSlug = `${slugBase}-${n++}`;

        const tags = row.tags
          ? row.tags.split("|").map((t) => t.trim()).filter(Boolean)
          : [];

        const termValue = ["1st", "2nd", "3rd"].includes(row.term?.trim())
          ? (row.term.trim() as "1st" | "2nd" | "3rd")
          : undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resource = await Resource.create({
          title: row.title.trim(),
          slug: finalSlug,
          subject: (subject as any)._id,
          medium,
          category: (category as any)._id,
          fileUrl: row.fileUrl.trim(),
          fileKey: row.fileKey.trim(),
          fileSize: row.fileSize ? parseInt(row.fileSize) : 0,
          fileType: row.fileType?.trim() || "pdf",
          description: row.description?.trim() || undefined,
          seoTitle: row.seoTitle?.trim() || undefined,
          seoDescription: row.seoDescription?.trim() || undefined,
          tags,
          year: row.year ? parseInt(row.year) : undefined,
          term: termValue,
          isActive: row.isActive !== "false",
          isFeatured: row.isFeatured === "true",
          uploadedBy: (session.user as { id?: string }).id,
        });

        results.push({ row: i + 1, success: true, slug: resource.slug });
      } catch (err: unknown) {
        results.push({
          row: i + 1,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      created: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
