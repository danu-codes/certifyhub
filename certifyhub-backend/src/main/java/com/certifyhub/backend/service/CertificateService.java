
package com.certifyhub.backend.service;

import com.certifyhub.backend.dto.CertificateSettings;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class CertificateService {

    private static final int WIDTH = 1000;
    private static final int HEIGHT = 707;

    public byte[] generateSingle(
            MultipartFile template,
            String name,
            CertificateSettings settings
    ) throws IOException {

        validateSettings(settings);

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                "Participant name is required."
            );
        }

        BufferedImage background = readTemplate(template);

        return createPDF(background, name.trim(), settings);
    }

    public byte[] generateBulk(
            MultipartFile template,
            List<String> names,
            CertificateSettings settings
    ) throws IOException {

        validateSettings(settings);

        if (names == null || names.isEmpty()) {
            throw new IllegalArgumentException(
                "No participants provided."
            );
        }

        if (names.size() > 500) {
            throw new IllegalArgumentException(
                "Maximum 500 participants per batch."
            );
        }

        BufferedImage background = readTemplate(template);

        ByteArrayOutputStream output =
            new ByteArrayOutputStream();

        try (ZipOutputStream zip =
                new ZipOutputStream(output)) {

            for (int i = 0; i < names.size(); i++) {

                String name = names.get(i);

                if (name == null || name.isBlank()) {
                    throw new IllegalArgumentException(
                        "Participant names cannot be empty."
                    );
                }

                byte[] pdf = createPDF(
                    background,
                    name.trim(),
                    settings
                );

                String filename = String.format(
                    "%03d_%s.pdf",
                    i + 1,
                    safeFilename(name)
                );

                zip.putNextEntry(new ZipEntry(filename));
                zip.write(pdf);
                zip.closeEntry();
            }
        }

        return output.toByteArray();
    }

    private BufferedImage readTemplate(
            MultipartFile template
    ) throws IOException {

        if (template == null || template.isEmpty()) {
            return null;
        }

        String contentType = template.getContentType();

        if (!"image/png".equals(contentType)
                && !"image/jpeg".equals(contentType)) {
            throw new IllegalArgumentException(
                "Template must be PNG or JPEG."
            );
        }

        try (InputStream input = template.getInputStream()) {
            BufferedImage image = ImageIO.read(input);

            if (image == null) {
                throw new IllegalArgumentException(
                    "Invalid certificate image."
                );
            }

            if ((long) image.getWidth() * image.getHeight()
                    > 20_000_000L) {
                throw new IllegalArgumentException(
                    "Template image dimensions are too large."
                );
            }

            return image;
        }
    }

    private byte[] createPDF(
            BufferedImage background,
            String name,
            CertificateSettings settings
    ) throws IOException {

        BufferedImage certificate =
            new BufferedImage(
                WIDTH,
                HEIGHT,
                BufferedImage.TYPE_INT_RGB
            );

        Graphics2D graphics = certificate.createGraphics();

        try {
            graphics.setRenderingHint(
                RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON
            );

            graphics.setRenderingHint(
                RenderingHints.KEY_TEXT_ANTIALIASING,
                RenderingHints.VALUE_TEXT_ANTIALIAS_ON
            );

            if (background != null) {
                graphics.drawImage(
                    background,
                    0,
                    0,
                    WIDTH,
                    HEIGHT,
                    null
                );
            } else {
                drawDefaultTemplate(graphics);
            }

            drawParticipantName(
                graphics,
                name,
                settings
            );

        } finally {
            graphics.dispose();
        }

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream output =
                 new ByteArrayOutputStream()) {

            PDPage page = new PDPage(
                new PDRectangle(842, 595)
            );

            document.addPage(page);

            PDImageXObject image =
                JPEGFactory.createFromImage(
                    document,
                    certificate,
                    0.95f
                );

            try (PDPageContentStream content =
                    new PDPageContentStream(document, page)) {

                content.drawImage(
                    image,
                    0,
                    0,
                    842,
                    595
                );
            }

            document.save(output);

            return output.toByteArray();
        }
    }

    private void drawDefaultTemplate(Graphics2D g) {

        g.setColor(new Color(255, 253, 248));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        g.setColor(new Color(201, 166, 93));
        g.setStroke(new BasicStroke(6));
        g.drawRect(25, 25, WIDTH - 50, HEIGHT - 50);

        g.setStroke(new BasicStroke(2));
        g.drawRect(42, 42, WIDTH - 84, HEIGHT - 84);

        drawCentered(
            g, "CERTIFYHUB", 95,
            new Font("SansSerif", Font.BOLD, 20),
            new Color(168, 134, 66)
        );

        drawCentered(
            g, "CERTIFICATE", 180,
            new Font("Serif", Font.BOLD, 65),
            new Color(37, 52, 86)
        );

        drawCentered(
            g, "OF PARTICIPATION", 220,
            new Font("SansSerif", Font.PLAIN, 22),
            new Color(141, 119, 79)
        );

        drawCentered(
            g, "This certificate is proudly presented to",
            300,
            new Font("SansSerif", Font.PLAIN, 21),
            Color.GRAY
        );

        drawCentered(
            g, "For their valuable participation and contribution",
            465,
            new Font("SansSerif", Font.PLAIN, 19),
            Color.GRAY
        );

        drawCentered(
            g, "to our event. We appreciate your dedication.",
            495,
            new Font("SansSerif", Font.PLAIN, 19),
            Color.GRAY
        );

        g.setColor(new Color(201, 166, 93));
        g.setStroke(new BasicStroke(2));

        g.drawLine(150, 600, 420, 600);
        g.drawLine(580, 600, 850, 600);

        g.setFont(new Font("SansSerif", Font.PLAIN, 16));
        g.setColor(Color.GRAY);

        drawCenteredAt(g, "DATE", 285, 630);
        drawCenteredAt(g, "AUTHORIZED SIGNATURE", 715, 630);
    }

    private void drawParticipantName(
            Graphics2D g,
            String name,
            CertificateSettings settings
    ) {

        int fontStyle = parseWeight(settings.getFontWeight());

        String family = resolveFont(settings.getFontFamily());

        int fontSize = settings.getFontSize();

        Font font = new Font(
            family,
            fontStyle,
            fontSize
        );

        FontMetrics metrics = g.getFontMetrics(font);

        while (metrics.stringWidth(name) > WIDTH * 0.85
                && fontSize > 18) {

            fontSize -= 2;

            font = new Font(
                family,
                fontStyle,
                fontSize
            );

            metrics = g.getFontMetrics(font);
        }

        g.setFont(font);

        try {
            g.setColor(Color.decode(settings.getColor()));
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(
                "Invalid text color."
            );
        }

        int x = (int) (WIDTH * settings.getX() / 100.0);
        int y = (int) (HEIGHT * settings.getY() / 100.0);

        int textWidth = metrics.stringWidth(name);

        // Center vertically around the requested position.
        int baseline = y
            + (metrics.getAscent() - metrics.getDescent()) / 2;

        g.drawString(
            name,
            x - textWidth / 2,
            baseline
        );
    }

    private String resolveFont(String requested) {

        if (requested == null || requested.isBlank()) {
            return "Serif";
        }

        String[] installed =
            GraphicsEnvironment
                .getLocalGraphicsEnvironment()
                .getAvailableFontFamilyNames();

        for (String font : installed) {
            if (font.equalsIgnoreCase(requested)) {
                return font;
            }
        }

        return "Serif";
    }

    private int parseWeight(String weight) {

        try {
            return Integer.parseInt(weight) >= 600
                ? Font.BOLD
                : Font.PLAIN;
        } catch (NumberFormatException ex) {
            return Font.PLAIN;
        }
    }

    private void drawCentered(
            Graphics2D g,
            String text,
            int y,
            Font font,
            Color color
    ) {
        g.setFont(font);
        g.setColor(color);
        drawCenteredAt(g, text, WIDTH / 2, y);
    }

    private void drawCenteredAt(
            Graphics2D g,
            String text,
            int x,
            int y
    ) {
        FontMetrics metrics = g.getFontMetrics();

        g.drawString(
            text,
            x - metrics.stringWidth(text) / 2,
            y
        );
    }

    private String safeFilename(String name) {

        String result = name
            .replaceAll("[^\\p{L}\\p{N}._-]+", "_")
            .replaceAll("^_+|_+$", "");

        if (result.isBlank()) {
            result = "participant";
        }

        return result.length() > 70
            ? result.substring(0, 70)
            : result;
    }

    private void validateSettings(
            CertificateSettings settings
    ) {
        if (settings == null) {
            throw new IllegalArgumentException(
                "Certificate settings are required."
            );
        }

        if (settings.getFontSize() < 10
                || settings.getFontSize() > 120) {
            throw new IllegalArgumentException(
                "Font size must be between 10 and 120."
            );
        }

        if (!Double.isFinite(settings.getX())
                || !Double.isFinite(settings.getY())
                || settings.getX() < 0
                || settings.getX() > 100
                || settings.getY() < 0
                || settings.getY() > 100) {
            throw new IllegalArgumentException(
                "Name position must be between 0 and 100."
            );
        }

        if (settings.getColor() == null
                || !settings.getColor()
                    .matches("^#[0-9a-fA-F]{6}$")) {
            throw new IllegalArgumentException(
                "Color must be a six-digit hexadecimal value."
            );
        }
    }
}
