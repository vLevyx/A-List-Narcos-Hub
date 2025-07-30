import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface AuthCodeErrorProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function AuthCodeError({ searchParams }: AuthCodeErrorProps) {
  const error = searchParams.error as string | undefined
  
  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return 'You cancelled the Discord authorization. Please try again if you want to sign in.'
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
        return 'Authorization Cancelled'
      case 'server_error':
        return 'Service Temporarily Unavailable'
      default:
        return 'Authentication Error'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-background-secondary/50 border border-red-500/20 rounded-xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            {getErrorTitle(error)}
          </h1>

          {/* Error Message */}
          <p className="text-text-secondary mb-8 leading-relaxed">
            {getErrorMessage(error)}
          </p>

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
              If the problem persists, contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}