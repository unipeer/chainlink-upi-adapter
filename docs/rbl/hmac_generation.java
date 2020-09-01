import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

public class hmac_generation {

    public static void main(String[] args) throws Exception {
        String KEY = "84316a1b9684047ce49c4b69af26f17ae207cbb54c1be752812b71d97b4cfa72"; 
                    
        String hmacForAuthToken = new String(encryptUsingAes256Key("rkicks|rkicks", KEY));	
        /*Here AGGREGATOR101 is the aggregator code and MC234 is the merchant code as registered in UPI Manager. Please pass your value shared by bank*/
        System.out.println(hmacForAuthToken);
    }

    private static int toDigit(char hexChar) {
	    int digit = Character.digit(hexChar, 16);
	    if(digit == -1) {
	        throw new IllegalArgumentException(
	          "Invalid Hexadecimal Character: "+ hexChar);
	    }
	    return digit;
    }

    public static byte hexToByte(String hexString) {
	    int firstDigit = toDigit(hexString.charAt(0));
	    int secondDigit = toDigit(hexString.charAt(1));
	    return (byte) ((firstDigit << 4) + secondDigit);
	}

    public static byte[] decodeHexString(String hexString) {
	    if (hexString.length() % 2 == 1) {
	        throw new IllegalArgumentException(
	          "Invalid hexadecimal String supplied.");
	    }
	    
	    byte[] bytes = new byte[hexString.length() / 2];
	    for (int i = 0; i < hexString.length(); i += 2) {
	        bytes[i / 2] = hexToByte(hexString.substring(i, i + 2));
	    }
	    return bytes;
    }

    private static String encryptUsingAes256Key(String message, String key) throws Exception {
        byte[] keyBytes = decodeHexString(key);

        SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        
        byte[] encryptedByte = cipher.doFinal(message.getBytes("UTF-8"));
        String encryptedText = Base64.getEncoder().encodeToString(encryptedByte);
        System.out.println("in security encrypted byte is" + encryptedByte.toString());
        System.out.println("in security encrypted text is" + encryptedText.toString());
        return encryptedText;
    }
}
