import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.awt.Color;
import java.util.ArrayList;
import java.util.Scanner;

/**
 * Conversor de gráficos
 *
 * Convierte gráficos de BMP/PNG a PNG, permitiendo cambiar ciertos colores por otros
 * Además con la opción de cambiar su tamaño a potencias de 2.
 *
 * Se pueden cambiar varios colores al mismo tiempo (o ninguno)
 * Se puede manipular el color del exceso del gráfico (si se usan potencias de 2).
 *
 * Thusing, 2017 - GS-ZONE
 */
public class Conversor {
    public static Scanner lector;

    public static String dirInput;
    public static String dirOutput;
    public static String extInput;
    public static String extOutput;
    public static String pow2;
    public static Color excedente;

    public static Color[][] colores;

    static {
        lector = new Scanner(System.in);

        dirInput = System.getProperty("user.dir") + "/grh/bmp";
        dirOutput = System.getProperty("user.dir") + "/grh/png";

        extInput = "bmp";
        extOutput = "png";

        pow2 = "si";
        excedente = new Color(0, 0, 0, 0);

        colores = new Color[1][2];
        colores[0][0] = new Color(0, 0, 0, 255);
        colores[0][1] = new Color(0, 0, 0, 0);
    }

    public static void main(String[] args) {
      convertir();
    }

    public static void convertir() {
        int current = 0;

        ArrayList<File> finalFiles = new ArrayList();

        System.out.println("From: " + dirInput);

        File dir = new File(dirInput);
        File[] files = dir.listFiles();

        for (File f : files) {
            String filePath = f.getPath();
            if (f.isFile() && (filePath.toLowerCase().endsWith("." + extInput))) {
                System.out.println("Queue: " + filePath);
                finalFiles.add(f);
            } else {
                System.out.println("Ignore: " + filePath);
            }
        }

        for (File f : finalFiles) {
            String name = f.getName().substring(0, f.getName().length() - 4);

            current += 1;

            try {

                BufferedImage img = ImageIO.read(new File(dirInput + "/" + name + "." + extInput));

                int width = img.getWidth();
                int height = img.getHeight();

                if (pow2.equals("si")) {
                    width = nextPow2(width);
                    height = nextPow2(height);
                }

                BufferedImage img2 = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
                for (int x = 0; x < img.getWidth(); x++) {
                    for (int y = 0; y < img.getHeight(); y++) {

                        Color c = new Color(img.getRGB(x, y), true);
                        img2.setRGB(x, y, img.getRGB(x, y));

                        for (int i = 0; i < colores.length; i++) {
                            if (c.getRGB() == colores[i][0].getRGB()) {
                                img2.setRGB(x, y, colores[i][1].getRGB());
                            }
                        }
                    }
                }

                if (pow2.equals("si"))
                for (int x = 0; x < img2.getWidth(); x++) {
                    for (int y = img.getHeight(); y < img2.getHeight(); y++) {
                        img2.setRGB(x, y, excedente.getRGB());
                    }
                }

                for (int x = img.getWidth(); x < img2.getWidth(); x++) {
                    for (int y = 0; y < img2.getHeight(); y++) {
                        img2.setRGB(x, y, excedente.getRGB());
                    }
                }

                ImageIO.write(img2, extOutput, new File(dirOutput + "/" + name + "." + extOutput));
                System.out.println("Process: " + name + " " + (int)(current / (float)finalFiles.size() * 100) + "%");
            }
            catch (IOException ex) {
                ex.printStackTrace();
            }
        }

    }

    public static int nextPow2(int num) {
        int i = 0;
        while (num > Math.pow(2, i)) {
            i++;
        }

        return (int)Math.pow(2, i);
    }

    public static String getSColor(Color c) {
        return "(" + c.getRed() + ", " + c.getGreen() + ", " + c.getBlue() + ", " + c.getAlpha() + ")";
    }
}
