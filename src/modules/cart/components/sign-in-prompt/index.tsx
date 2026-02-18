import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <Card className="border-border/70 bg-card/85">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Already have an account?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to save your cart and checkout faster.
          </p>
        </div>
        <LocalizedClientLink href="/account" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            className="h-10 w-full sm:min-w-36"
            data-testid="sign-in-button"
          >
            Sign in
          </Button>
        </LocalizedClientLink>
      </CardContent>
    </Card>
  )
}

export default SignInPrompt
