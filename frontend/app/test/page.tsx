import WalletConnectButton from "@/components/petra/ConnectButton";

const YourPage = () => {
  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <h1>Your App Name</h1>
        <WalletConnectButton />
      </header>

      {/* Rest of your page content */}
    </div>
  );
};

export default YourPage;
