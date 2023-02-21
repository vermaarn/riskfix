import { useEffect } from "react";
import QrReader from "react-qr-reader";


interface QRReaderProps {
  bedside_info: string;
  bedside_devices: string | null;
  setBedsideDevices: React.Dispatch<React.SetStateAction<string | null>>;
  setBedsideInfo: React.Dispatch<React.SetStateAction<string>>;
  handleScan: (data: any) => void;
  handleError: (err: any) => void;

}

function QRReader({
  bedside_info,
  setBedsideInfo,
  bedside_devices,
  setBedsideDevices,
  handleScan,
  handleError
}: QRReaderProps) {


  useEffect(() => {
    setBedsideInfo("(none)");
    setBedsideDevices(null);
  }, []);

  const handleScanInner = (data: any) => {
    if (data !== null) {
      setBedsideInfo(data);
    }
    handleScan(data);
  };

  return (
    <div className="flex flex-col ">
      <div className="flex flex-col text-center space-y-2 p-4 w-full text-xl  bg-gray-100 ">
        <div className="underline">
          Scan the bedside QR code to access a patient's predictions
        </div>
        <div>
          You've scanned the following code: <strong> {bedside_info} </strong>
        </div>
        <div>
          This bed is associated with these device_ids:{" "}
          <strong> {bedside_devices} </strong> <br />
          {bedside_devices !== null &&
            bedside_devices !== "No associated devices found" && (
              <span className="text-md font-semibold">Scan Successful. Switching to Prebias Assessment...</span>
            )}
        </div>
      </div>
      <div className="flex justify-center p-4 rounded-lg bg-gray-200">
        <QrReader
          className="qr-reader-component"
          onError={handleError}
          onScan={handleScanInner}
          style={{ width: "50%" }}
        />
      </div>
    </div>
  );
}

export default QRReader
