import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Home, RefreshCw, Mail, ExternalLink } from 'lucide-react'

interface AuthCodeErrorProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function AuthCodeError({ searchParams }: AuthCodeErrorProps) {
  const error = searchParams.error as string | undefined
 
  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return (
          <div className="space-y-4">
            <p className="text-text-secondary leading-relaxed">
              Authentication was cancelled or blocked. This can happen if you:
            </p>
            <div className="bg-background-secondary/30 border border-white/10 rounded-lg p-4 text-left">
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Cancelled the Discord authorization process</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Don't have a verified email address on your Discord account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Denied access to required permissions</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 font-medium mb-2">Email Verification Required</p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    If your Discord email isn't verified, please verify it in your{' '}
                    <a 
                      href="https://discord.com/channels/@me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                    >
                      Discord settings
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {' '}and then try signing in again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'invalid_request':
        return 'There was an issue with the authentication request. Please try again.'
      case 'server_error':
        return 'Discord is experiencing issues. Please try again in a few minutes.'
      default:
        return 'We couldn\'t complete your login. This might be due to an expired or invalid authentication code.'
    }
  }

  const getErrorTitle = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return 'Authentication Cancelled or Blocked'
      case 'server_error':
        return 'Service Temporarily Unavailable'
      default:
        return 'Authentication Error'
    }
  }

  const getErrorIcon = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return <AlertTriangle className="w-8 h-8 text-red-400" />
      default:
        return <AlertTriangle className="w-8 h-8 text-red-400" />
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-background-secondary/50 border border-red-500/20 rounded-xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            {getErrorIcon(error)}
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-red-400 mb-6">
            {getErrorTitle(error)}
          </h1>

          {/* Error Message */}
          <div className="mb-8">
            {typeof getErrorMessage(error) === 'string' ? (
              <p className="text-text-secondary leading-relaxed">
                {getErrorMessage(error)}
              </p>
            ) : (
              getErrorMessage(error)
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
           
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-text-secondary">
              Still having trouble? Check your internet connection or try again later.
              <br />
              If the problem persists, contact us in our Discord.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}