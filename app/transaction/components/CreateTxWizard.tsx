import { useState } from "react"
import { Form } from "react-final-form"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"

const Page = ({ children }) => children
const CreateTxWizard = ({ children, initialValues, onSubmit, onCancel }) => {
  const [page, setPage] = useState<number>(0)
  const [formValues, setFormValues] = useState<any>(initialValues || {})

  const activePage = children[page]
  const isLastPage = page === children.length - 1

  const next = (values) => {
    setPage(Math.min(page + 1, children.length - 1))
    setFormValues(values)
  }

  const previous = () => {
    setPage(Math.max(page - 1, 0))
  }

  const validate = (values) => {
    return activePage.props.validate ? activePage.props.validate(values) : {}
  }

  const reset = () => {
    setPage(0)
    setFormValues({})
  }

  return (
    <Form
      initialValues={formValues}
      validate={validate}
      onSubmit={() => {}} // empty, because this is nested and we aren't actually submitting form
      render={({ submitting, handleSubmit, values }) => {
        return (
          <form onSubmit={handleSubmit}>
            <span
              onClick={() => {
                reset()
                onCancel()
              }}
              className="text-marble-white absolute z-50 right-2 top-2"
            >
              <img src="/exit-button.svg" alt="Close button" />
            </span>
            {activePage}
            <div className="mt-8 space-x-4">
              {page > 0 && (
                <Button type={ButtonType.Unemphasized} onClick={previous}>
                  Previous
                </Button>
              )}
              {!isLastPage && (
                <Button type={ButtonType.Unemphasized} onClick={() => next(values)}>
                  Next
                </Button>
              )}
              {isLastPage && (
                <Button
                  isSubmitType={false}
                  isDisabled={submitting}
                  onClick={() => {
                    const isLastPage = page === children.length - 1
                    if (isLastPage) {
                      reset()
                      return onSubmit(values)
                    } else {
                      next(values)
                    }
                  }}
                >
                  Submit
                </Button>
              )}
            </div>
          </form>
        )
      }}
    />
  )
}

CreateTxWizard.Page = Page
export default CreateTxWizard
