import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function GET(req: NextRequest) {
  // Verify revalidation secret  return Response.json({ message: "-GET- Revalidation endpoint -GET-" }, { status: 200 })
  const searchParams = req.nextUrl.searchParams
  const secret = searchParams.get("secret")
  const tags = searchParams.get("tags") as string
  const paths = searchParams.get("paths") as string

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid revalidation secret" }, { status: 401 })
  }

  if (!tags && !paths) {
    return NextResponse.json({ error: "No tags or paths provided" }, { status: 400 })
  }

  const revalidatedPaths: string[] = []
  const revalidatedTags: string[] = []

  // Handle tag-based revalidation
  if (tags) {
    const tagsArray = tags.split(",")
    await Promise.all(
      tagsArray.map(async (tag) => {
        revalidatedTags.push(tag)
        switch (tag) {
          case "products":
            // Revalidate main products page
            revalidatePath("/us/store/products")
            revalidatedPaths.push("/us/store/products")
            // Revalidate individual product pages
            revalidatePath("/[countryCode]/(main)/products/[handle]", "page")
            revalidatedPaths.push("/[countryCode]/(main)/products/[handle]")
            break
          case "collections":
            revalidatePath("/us/store/collections")
            revalidatedPaths.push("/us/store/collections")
            revalidatePath("/[countryCode]/(main)/collections/[handle]", "page")
            revalidatedPaths.push("/[countryCode]/(main)/collections/[handle]")
            break
          case "categories":
            revalidatePath("/us/store/categories")
            revalidatedPaths.push("/us/store/categories")
            revalidatePath("/[countryCode]/(main)/categories/[handle]", "page")
            revalidatedPaths.push("/[countryCode]/(main)/categories/[handle]")
            break
          case "cart":
            revalidatePath("/us/store/cart")
            revalidatedPaths.push("/us/store/cart")
            revalidatePath("/[countryCode]/(main)/cart", "page")
            revalidatedPaths.push("/[countryCode]/(main)/cart")
            break
          case "homepage":
            revalidatePath("/")
            revalidatedPaths.push("/")
            revalidatePath("/us")
            revalidatedPaths.push("/us")
            break
          case "search":
            revalidatePath("/us/store/search")
            revalidatedPaths.push("/us/store/search")
            revalidatePath("/[countryCode]/(main)/search", "page")
            revalidatedPaths.push("/[countryCode]/(main)/search")
            break
          case "account":
            revalidatePath("/us/store/account")
            revalidatedPaths.push("/us/store/account")
            revalidatePath("/[countryCode]/(main)/account", "page")
            revalidatedPaths.push("/[countryCode]/(main)/account")
            break
          case "checkout":
            revalidatePath("/us/store/checkout")
            revalidatedPaths.push("/us/store/checkout")
            revalidatePath("/[countryCode]/(main)/checkout", "page")
            revalidatedPaths.push("/[countryCode]/(main)/checkout")
            break
          case "regions":
            revalidatePath("/", "page")
            revalidatedPaths.push("/")
            revalidatePath("/us", "page")
            revalidatedPaths.push("/us")
            revalidatePath("/[countryCode]", "page")
            revalidatedPaths.push("/[countryCode]")
            // Revalidate all product pages as pricing may change
            revalidatePath("/[countryCode]/(main)/products/[handle]", "page")
            revalidatedPaths.push("/[countryCode]/(main)/products/[handle]")
            // Revalidate cart as shipping/payment options may change
            revalidatePath("/[countryCode]/(main)/cart", "page")
            revalidatedPaths.push("/[countryCode]/(main)/cart")
            break
          default:
            console.warn(`Unknown revalidation tag: ${tag}`)
        }
      })
    )
  }

  // Handle direct path revalidation
  if (paths) {
    const pathsArray = paths.split(",")
    await Promise.all(
      pathsArray.map(async (path) => {
        revalidatePath(path)
        revalidatedPaths.push(path)
      })
    )
  }

  return NextResponse.json({ 
    message: "Revalidated successfully",
    revalidatedTags,
    revalidatedPaths
  }, { status: 200 })
}
