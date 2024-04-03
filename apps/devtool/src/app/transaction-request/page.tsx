import TransactionRequestEditor from './_components/TransactionRequestEditor'

export default async function TransactionRequest() {
  return (
    <>
      <div className="text-nv-2xl mb-10">Transaction Request Playground</div>
      <TransactionRequestEditor />
    </>
  )
}
